"use client"

import { useEffect, useState } from "react"

export default function NetworkStats() {
  const [loadTime, setLoadTime] = useState<number | null>(null)
  const [fcpTime, setFcpTime] = useState<number | null>(null)
  const [hydrationTime, setHydrationTime] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && window.performance) {
      const navigationStart = window.performance.timing.navigationStart

      // Calculate total page load time
      const handleLoad = () => {
        if (window.performance.timing.loadEventEnd > 0) {
          const totalTime = window.performance.timing.loadEventEnd - navigationStart
          setLoadTime(totalTime > 0 ? totalTime : null)
          window.removeEventListener("load", handleLoad) // Clean up listener
        }
      }

      if (window.performance.timing.loadEventEnd > 0) {
        handleLoad() // If already loaded
      } else {
        window.addEventListener("load", handleLoad) // Otherwise, wait for load event
      }

      // Calculate approximate hydration time (time until this effect runs)
      const hydTime = Math.round(performance.now())
      setHydrationTime(hydTime)

      // Get FCP using PerformanceObserver
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntriesByName("first-contentful-paint")) {
            setFcpTime(Math.round(entry.startTime))
            observer.disconnect() // Got the value, no need to observe further
            break
          }
        })
        observer.observe({ type: "paint", buffered: true })
      } catch (e) {
        console.error("PerformanceObserver for FCP not supported.", e)
        // Fallback for older browsers or environments? Maybe leave as null.
      }

      // Cleanup function for the load listener if component unmounts before load
      return () => {
        window.removeEventListener("load", handleLoad)
      }
    }
  }, [])

  const renderMetric = (value: number | null, label: string) => (
    <div className="flex justify-between w-full px-2 text-xs">
      <span className="text-amber-300">{label}:</span>
      {value !== null ? (
        <span className="font-mono text-amber-400">{value} ms</span>
      ) : (
        <span className="font-mono text-amber-400 italic">...</span>
      )}
    </div>
  )

  return (
    <div className="overflow-hidden border rounded-md border-amber-800/50 bg-zinc-800/30">
      <div className="relative flex items-center justify-center p-2 border-b border-amber-800/50">
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm font-bold text-amber-500">Performance</div>
      </div>

      <div className="p-4 flex flex-col items-center justify-center h-48 space-y-2">
        {renderMetric(fcpTime, "First Contentful Paint")}
        {renderMetric(hydrationTime, "Initial Render")}
        {renderMetric(loadTime, "Full Page Load")}
      </div>
    </div>
  )
}

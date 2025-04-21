"use client"

import { useEffect, useState } from "react"

export default function NetworkStats() {
  const [loadTime, setLoadTime] = useState<number | null>(null)

  useEffect(() => {
    // Calculate page load time
    if (typeof window !== "undefined" && window.performance?.timing) {
      const timing = window.performance.timing
      const time = timing.loadEventEnd - timing.navigationStart
      if (time > 0) {
        setLoadTime(time)
      }
    }
  }, []) // Empty dependency array ensures this runs only once on mount

  return (
    <div className="overflow-hidden border rounded-md border-amber-800/50 bg-zinc-800/30">
      <div className="relative flex items-center justify-center p-2 border-b border-amber-800/50">
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm font-bold text-amber-500">System Monitor</div>
      </div>

      <div className="p-4 flex flex-col items-center justify-center h-48">
        <div className="text-sm font-bold text-amber-500 mb-2">Page Load Time</div>
        {loadTime !== null ? (
          <div className="text-2xl font-mono text-amber-400">
            {loadTime} ms
          </div>
        ) : (
          <div className="text-lg font-mono text-amber-400 italic">Calculating...</div>
        )}
      </div>
    </div>
  )
}

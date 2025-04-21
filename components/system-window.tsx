import type React from "react"
interface SystemWindowProps {
  title: string
  children: React.ReactNode
}

export default function SystemWindow({ title, children }: SystemWindowProps) {
  return (
    <div className="overflow-hidden border rounded-md border-amber-800/50 bg-zinc-800/30">
      <div className="flex items-center justify-between p-2 border-b border-amber-800/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm font-bold text-amber-500">{title}</div>
        <div className="w-16"></div>
      </div>
      <div className="p-4 text-sm">{children}</div>
    </div>
  )
}

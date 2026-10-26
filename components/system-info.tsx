import { education, highSchoolCoursework } from "@/lib/portfolio"

export default function SystemInfo() {
  const systemInfo = [
    { label: "Name", value: "Liem Luttrell" },
    { label: "Location", value: "" },
    { label: "Email", value: "liem@epicliem.com" },
    { label: "Phone", value: "" },
    { label: "Education", value: education.map((entry) => [entry.school, entry.program, entry.graduation].filter(Boolean).join("\n")).join("\n\n") },
    { label: "High school coursework", value: highSchoolCoursework.slice(0, 2).join(", ") },
  ]

  return (
    <div className="overflow-hidden border rounded-md border-amber-800/50 bg-zinc-800/30">
      <div className="flex items-center justify-between p-2 border-b border-amber-800/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm font-bold text-amber-500">System Information</div>
        <div className="w-16"></div>
      </div>
      <div className="p-4 text-sm">
        <div className="mb-4">
          <h3 className="mb-2 text-xs font-bold uppercase text-amber-500">Personal Info</h3>
          <table className="w-full">
            <tbody>
              {systemInfo.map((item, index) => (
                <tr key={index} className="border-b border-zinc-700/30 last:border-0">
                  <td className="py-1 pr-4 align-top text-amber-400">{item.label}:</td>
                  <td className="py-1 whitespace-pre-line text-amber-200">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

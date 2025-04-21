export default function SystemInfo() {
  const systemInfo = [
    { label: "Name", value: "Liem Luttrell" },
    { label: "Location", value: "819 N 4th St" },
    { label: "Email", value: "liem@epicliem.com" },
    { label: "Phone", value: "+1 (267)-800-4362" },
    { label: "Education", value: "Germantown Friends School (Junior)" },
    { label: "Courses", value: "CS 1-3, CS Capstone" },
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
                  <td className="py-1 pr-4 text-amber-400">{item.label}:</td>
                  <td className="py-1 text-amber-200">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

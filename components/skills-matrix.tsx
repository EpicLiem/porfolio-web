export default function SkillsMatrix() {
  const programmingSkills = [
    { name: "Python", level: 95 },
    { name: "JavaScript", level: 90 },
    { name: "Rust", level: 75 },
    { name: "Java", level: 70 },
    { name: "Fish Shell", level: 65 },
    { name: "Bash Scripting", level: 60 },
  ]

  const toolsSkills = [
    { name: "GitHub", level: 90 },
    { name: "AWS", level: 75 },
    { name: "Google Cloud Platform", level: 80 },
    { name: "Docker", level: 85 },
    { name: "RDBMS (SQL)", level: 70 },
    { name: "Wireguard", level: 70 },
    { name: "Linux", level: 80 },
    { name: "Windows", level: 85 },
    { name: "Mac", level: 85 },
    { name: "Playwright", level: 75 },
    { name: "React/Next.js", level: 85 }, // Combined React and Next.js
  ]

  const interests = [
    "Cooking",
    "Kitchen Tools",
    "Volunteering (SAT Tutor, Manna)",
    "Financial Literacy Education",
    "Artificial Intelligence",
    "Web Development",
    "Hardware/Electronics",
  ]

  return (
    <div className="space-y-6">
      <div className="overflow-hidden border rounded-md border-amber-800/50 bg-zinc-800/30">
        <div className="flex items-center justify-between p-2 border-b border-amber-800/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-sm font-bold text-amber-500">Programming Languages</div>
          <div className="w-16"></div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {programmingSkills.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-amber-300">{skill.name}</span>
                  <span className="text-xs text-amber-400">{skill.level}%</span>
                </div>
                <div className="w-full h-2 overflow-hidden rounded-full bg-zinc-700">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${skill.level}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden border rounded-md border-amber-800/50 bg-zinc-800/30">
        <div className="flex items-center justify-between p-2 border-b border-amber-800/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-sm font-bold text-amber-500">Tools & Frameworks</div>
          <div className="w-16"></div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {toolsSkills.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-amber-300">{skill.name}</span>
                  <span className="text-xs text-amber-400">{skill.level}%</span>
                </div>
                <div className="w-full h-2 overflow-hidden rounded-full bg-zinc-700">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${skill.level}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden border rounded-md border-amber-800/50 bg-zinc-800/30">
        <div className="flex items-center justify-between p-2 border-b border-amber-800/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-sm font-bold text-amber-500">Interests & Languages</div>
          <div className="w-16"></div>
        </div>
        <div className="p-4">
          <h3 className="mb-3 text-xs font-bold uppercase text-amber-400">Interests</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {interests.map((interest) => (
              <div key={interest} className="px-2 py-1 text-xs rounded-md bg-zinc-700 text-amber-300">
                {interest}
              </div>
            ))}
          </div>

          <h3 className="mb-3 text-xs font-bold uppercase text-amber-400">Languages</h3>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 text-xs rounded-md bg-zinc-700 text-amber-300">English (Native)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

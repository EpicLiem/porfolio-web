import { Cpu, Cloud, Code, Terminal, Database, Network, Monitor } from "lucide-react"

export default function SkillsMatrix() {
  const programmingSkills = [
    { name: "Python", icon: <Code className="w-3 h-3 mr-1" /> },
    { name: "JavaScript", icon: <Code className="w-3 h-3 mr-1" /> },
    { name: "Rust", icon: <Code className="w-3 h-3 mr-1" /> },
    { name: "Java", icon: <Code className="w-3 h-3 mr-1" /> },
    { name: "Fish Shell", icon: <Terminal className="w-3 h-3 mr-1" /> },
    { name: "Bash Scripting", icon: <Terminal className="w-3 h-3 mr-1" /> },
  ]

  const toolCategories = {
    "Cloud & DevOps": [
      { name: "AWS", icon: <Cloud className="w-3 h-3 mr-1" /> },
      { name: "Google Cloud Platform", icon: <Cloud className="w-3 h-3 mr-1" /> },
      { name: "Docker", icon: <Cpu className="w-3 h-3 mr-1" /> },
    ],
    "Web Technologies": [
      { name: "React/Next.js", icon: <Code className="w-3 h-3 mr-1" /> },
      { name: "Playwright", icon: <Monitor className="w-3 h-3 mr-1" /> },
    ],
    "Databases & Networking": [
      { name: "RDBMS (SQL)", icon: <Database className="w-3 h-3 mr-1" /> },
      { name: "Wireguard", icon: <Network className="w-3 h-3 mr-1" /> },
    ],
    "Platforms & Tools": [
      { name: "GitHub", icon: <Code className="w-3 h-3 mr-1" /> },
      { name: "Linux", icon: <Terminal className="w-3 h-3 mr-1" /> },
      { name: "Windows", icon: <Terminal className="w-3 h-3 mr-1" /> },
      { name: "Mac", icon: <Terminal className="w-3 h-3 mr-1" /> },
    ],
  }

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
          <div className="flex flex-wrap gap-2">
            {programmingSkills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center px-2 py-1 text-xs rounded-md bg-zinc-700 text-amber-300 transition-colors hover:bg-amber-500 hover:text-zinc-900 cursor-default"
              >
                {skill.icon}
                {skill.name}
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
          <div className="text-sm font-bold text-amber-500">Tools & Platforms</div>
          <div className="w-16"></div>
        </div>
        <div className="p-4 space-y-4">
          {Object.entries(toolCategories).map(([category, skills]) => (
            <div key={category}>
              <h4 className="mb-2 text-xs font-semibold tracking-wide uppercase text-amber-400">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center px-2 py-1 text-xs rounded-md bg-zinc-700 text-amber-300 transition-colors hover:bg-amber-500 hover:text-zinc-900 cursor-default"
                  >
                    {skill.icon}
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
              <div
                key={interest}
                className="px-2 py-1 text-xs rounded-md bg-zinc-700 text-amber-300 transition-colors hover:bg-amber-500 hover:text-zinc-900 cursor-default"
              >
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

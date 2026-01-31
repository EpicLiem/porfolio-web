export default function ProjectsList() {
  const projects = [
    {
      name: "EMP",
      date: "April 2025 - Present",
      description: [
        "Researched EMP design, feasibility, and safety",
        "Designed a small EMP generator and current WIP",
      ],
      technologies: ["Hardware", "Electronics", "Physics"],
    },
    {
      name: "Micropantry (CIO)",
      date: "February 2025 - Present",
      description: [
        "Collaborated with classmates to design an app that tracks your pantry to recommend personalized healthy recipes using AI.",
        "Wrote the backend in Express and deployed it as a Firebase Function.",
        "Wrote business logic on the front end, and cleaned up UX",
        "Won Comcast student competition",
      ],
      technologies: ["Express.js", "Firebase Functions", "Node.js", "AI", "Mobile App"],
    },
    {
      name: "Epicliem.com",
      date: "January 2022 - Present",
      description: [
        "Functionally serves as a repo and showcase for my work",
        "Deployed to AWS using their stack (Route 53, etc.)",
        "Migrated from a static site hosted on an S3 bucket to a dynamic, interactive webpage using Vercel and Next.js.",
      ],
      technologies: ["AWS", "Vercel", "Next.js", "React", "Web Development"],
    },
    {
      name: "Wake On Lan Server",
      date: "September - October 2023",
      description: [
        "Deployed Ubuntu on a used Dell Optiplex.",
        "Ran a containerized Wake On Lan Server written in Python that sent a magic packet to my computer to wake it up using Docker and deployed the server on a Dell Optiplex in my garage.",
        "Installed Docker containers, wireguard vpn, bitwarden, and a minecraft server",
      ],
      technologies: ["Python", "Docker", "Linux", "Networking", "Self-Hosting", "Wireguard"],
    },
    {
      name: "ChessAI",
      date: "June 2023",
      description: [
        "Researched muzero and alphazero papers to determine best approach",
        "Implemented muzero",
        "Trained the model using Google Cloud TPUs",
      ],
      technologies: ["Python", "TensorFlow", "Reinforcement Learning", "Google Cloud", "AI"],
      github: "https://github.com/epicliem/chessai",
    },
    {
      name: "Miller-Rabin Primality Test",
      date: "October 2022",
      description: [
        "Researched prime number algorithms",
        "Implemented in Rust as a means to better learn that language",
      ],
      technologies: ["Rust", "Algorithms", "Number Theory"],
      github: "https://github.com/epicliem/miller-rabin",
    },
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
          <div className="text-sm font-bold text-amber-500">Projects</div>
          <div className="w-16"></div>
        </div>
        <div className="p-4">
          <div className="space-y-6">
            {projects.map((project, index) => (
              <div key={index} className="p-3 border rounded-md border-amber-800/30 bg-zinc-800/30">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-amber-500">{project.name}</h3>
                  <div className="px-2 py-1 text-xs rounded bg-zinc-700 text-amber-300">{project.date}</div>
                </div>

                <div className="mt-3">
                  <h4 className="mb-2 text-xs font-bold uppercase text-amber-400">Description:</h4>
                  <ul className="pl-5 space-y-1 list-disc text-amber-200">
                    {project.description.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded bg-zinc-700 text-amber-300">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* <div className="flex justify-end mt-3">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-1 text-xs transition-colors rounded-md border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-zinc-900"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3 mr-1"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                    View Code
                  </a>
                </div> */}
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
          <div className="text-sm font-bold text-amber-500">Project Timeline</div>
          <div className="w-16"></div>
        </div>
        <div className="p-4">
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-3 border-l-2 border-dashed border-amber-800/50"></div>

            <div className="relative pl-10 mb-8">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-amber-900 border-2 border-amber-500"></div>
              <div className="mb-1 text-sm text-amber-400">April 2025 - Present</div>
              <div className="text-lg font-bold text-amber-500">EMP</div>
              <p className="mt-1 text-amber-200">Researching and designing a small EMP generator.</p>
            </div>

            <div className="relative pl-10 mb-8">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-amber-900 border-2 border-amber-500"></div>
              <div className="mb-1 text-sm text-amber-400">February 2025 - Present</div>
              <div className="text-lg font-bold text-amber-500">Micropantry (Volunteer)</div>
              <p className="mt-1 text-amber-200">Developed backend for a recipe recommendation app.</p>
            </div>

            <div className="relative pl-10 mb-8">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-amber-900 border-2 border-amber-500"></div>
              <div className="mb-1 text-sm text-amber-400">January 2022 - Present</div>
              <div className="text-lg font-bold text-amber-500">Epicliem.com</div>
              <p className="mt-1 text-amber-200">Developing and maintaining personal portfolio site.</p>
            </div>

            <div className="relative pl-10 mb-8">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-amber-900 border-2 border-amber-500"></div>
              <div className="mb-1 text-sm text-amber-400">September - October 2023</div>
              <div className="text-lg font-bold text-amber-500">Wake On Lan Server</div>
              <p className="mt-1 text-amber-200">Set up a self-hosted server with various services.</p>
            </div>

            <div className="relative pl-10 mb-8">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-amber-900 border-2 border-amber-500"></div>
              <div className="mb-1 text-sm text-amber-400">June 2023</div>
              <div className="text-lg font-bold text-amber-500">ChessAI</div>
              <p className="mt-1 text-amber-200">Implemented MuZero algorithm and trained on Google Cloud TPUs</p>
            </div>

            <div className="relative pl-10">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-amber-900 border-2 border-amber-500"></div>
              <div className="mb-1 text-sm text-amber-400">October 2022</div>
              <div className="text-lg font-bold text-amber-500">Miller-Rabin Primality Test</div>
              <p className="mt-1 text-amber-200">Implemented the algorithm in Rust</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

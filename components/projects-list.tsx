export default function ProjectsList() {
  const projects = [
    {
      name: "ChessAI",
      date: "June 2023",
      description: [
        "Read muzero and alphazero papers, and then implemented muzero",
        "Trained the model on Google cloud TPUs",
      ],
      technologies: ["Python", "TensorFlow", "Reinforcement Learning", "Google Cloud"],
      github: "https://github.com/epicliem/chessai",
    },
    {
      name: "Miller-Rabin Primality Test",
      date: "October 2022",
      description: ["Read about the algorithm", "Implemented the algorithm in rust, which I was still learning"],
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

                <div className="flex justify-end mt-3">
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
          <div className="text-sm font-bold text-amber-500">Project Timeline</div>
          <div className="w-16"></div>
        </div>
        <div className="p-4">
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-3 border-l-2 border-dashed border-amber-800/50"></div>
            

            <div className="relative pl-10 mb-8">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-amber-900 border-2 border-amber-500"></div>
              <div className="mb-1 text-sm text-amber-400">Future</div>
              <div className="text-lg font-bold text-amber-500">Upcoming Projects</div>
              <p className="mt-1 text-amber-200">Stay tuned for more exciting projects...</p>
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

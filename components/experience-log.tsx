export default function ExperienceLog() {
  const experiences = [
    {
      company: "Honeycake",
      position: "Dev Ops Intern",
      period: "February 2025 - March 2025",
      location: "Philadelphia, PA",
      description: [
        "Reported to Monica Quigg, Co-Founder / VP Engineering",
        "Set up and deployed python api in Google Cloud Platform",
        "Installed postgres database",
        "Trained other employees on access, and procedures for code and database updates",
      ],
      technologies: ["Python", "GCP", "PostgreSQL", "DevOps"],
    },
    {
      company: "Human Security",
      position: "Data Analyst Intern",
      period: "January 2025",
      location: "New York, NY",
      description: [
        "Reported to Francis Kitrick, Manager, Strategic Customer Research",
        "Analyzed suspicious internet traffic to determine origin and whether it was malicious",
        "Leveraged multiple RDBMS databases",
        "Successfully detected multiple 'cash-out' domains",
      ],
      technologies: ["Data Analysis", "RDBMS", "Security"],
    },
    {
      company: "Good-Loop.com (B Corp)",
      position: "Software Development Intern",
      period: "June 2024 – August 2024",
      location: "Edinburgh, UK",
      description: [
        "Worked directly under Craig Robertson, PhD, Head of Engineering",
        "Designed and implemented a headless web scraper using Playwright and python for the purpose of automating the classification of websites using AI.",
        "Analyzed the features extracted through the web scraper with a Self Organizing Map",
        "Patent application in progress",
      ],
      technologies: ["Python", "Playwright", "Web Scraping", "AI", "SOM", "Data Analysis"],
    },
    {
      company: "Seeds of Fortune (Non-Profit)",
      position: "Software Development Intern",
      period: "June 2023 - August 2023",
      location: "Remote",
      description: [
        "Reported to Executive Director Nitiya Walker",
        "Created a gamified financial simulation using React and Next.js for the purpose of providing disadvantaged high school students the ability to create budgets for college life.",
        "Implemented continuous revisions based on customer feedback",
      ],
      technologies: ["React", "Next.js", "JavaScript", "Web Development", "UI/UX"],
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
          <div className="text-sm font-bold text-amber-500">Work Experience</div>
          <div className="w-16"></div>
        </div>
        <div className="p-4">
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={index} className="p-3 border rounded-md border-amber-800/30 bg-zinc-800/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-amber-500">{exp.company}</h3>
                    <p className="text-amber-200">{exp.position}</p>
                  </div>
                  <div className="px-2 py-1 text-xs rounded bg-zinc-700 text-amber-300">{exp.period}</div>
                </div>

                <div className="flex items-center mt-2 text-sm text-amber-400">
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
                    className="w-4 h-4 mr-1"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {exp.location}
                </div>

                <div className="mt-3">
                  <h4 className="mb-2 text-xs font-bold uppercase text-amber-400">Responsibilities:</h4>
                  <ul className="pl-5 space-y-1 list-disc text-amber-200">
                    {exp.description.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {exp.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded bg-zinc-700 text-amber-300">
                      {tech}
                    </span>
                  ))}
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
          <div className="text-sm font-bold text-amber-500">Education</div>
          <div className="w-16"></div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-bold text-amber-500">Germantown Friends School</h4>
              <p className="text-amber-200">Junior</p>
            </div>
            <div className="px-2 py-1 text-xs rounded bg-zinc-700 text-amber-300">Present</div>
          </div>

          <div className="mt-4">
            <h4 className="mb-2 text-xs font-bold uppercase text-amber-400">Relevant Coursework:</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs rounded bg-zinc-700 text-amber-300">CS 1-3</span>
              <span className="px-2 py-1 text-xs rounded bg-zinc-700 text-amber-300">CS Capstone</span>
              <span className="px-2 py-1 text-xs rounded bg-zinc-700 text-amber-300">Differential Calculus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

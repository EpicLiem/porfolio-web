export const about = "Welcome! I'm Liem, a student in Boston University's College of Engineering. I'm currently Engineering Undecided and expect to graduate in 2030, with interests in software development and AI."

export const highSchoolCoursework = ["CS 1-3", "CS Capstone", "Differential Calculus"]

export const education = [
  { school: "Boston University College of Engineering", program: "Engineering Undecided", graduation: "Expected graduation 2030" },
  { school: "Germantown Friends School", program: "", graduation: "Graduated 2026" },
]

export interface Project {
  name: string
  date: string
  description: string[]
  technologies: string[]
  github?: string
  links?: { label: string; href: string }[]
}

export const newProjects: Project[] = [
  {
    name: "Flowcast",
    date: "October 2026",
    description: [
      "Flowcast is a 3D campus simulation of 36,977 synthetic students, informed by 5,904 class meetings. It models campus movement and incidents.",
      "I worked on data scraping and built most of the simulation, including incident modeling and tuning the simulation to match the source data.",
      "Winner, Best First-Time Hacker, DS+X 2026 | October 25, 2026",
    ],
    technologies: [],
    links: [
      { label: "Project write-up", href: "https://devpost.com/software/flowcast-0iwt56" },
      { label: "GitHub repository", href: "https://github.com/Darkest-Teddy/Flowcast" },
      { label: "Live demo", href: "https://flowcastmap.com" },
    ],
  },
  {
    name: "NoteBrew",
    date: "May 2025",
    description: ["I built and shipped NoteBrew, a coffee-logging app with a searchable history and preference analytics. Released in May 2025, it helps users keep track of their coffees and explore their preferences."],
    technologies: [],
    links: [{ label: "View NoteBrew on the App Store", href: "https://apps.apple.com/us/app/notebrew/id6745646814" }],
  },
]

export const newProjectTimeline = [
  { ...newProjects[0], summary: "Built most of a 3D campus simulation and worked on data scraping. Won Best First-Time Hacker at DS+X 2026." },
  { ...newProjects[1], summary: "Shipped a coffee-logging app with searchable history and preference analytics." },
]

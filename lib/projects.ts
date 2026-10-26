import { newProjects, type Project } from "./portfolio"

export const projects: Project[] = [
  ...newProjects,
  {
    name: "EMP",
    date: "Summer 2026",
    description: [
      "Researched EMP design, feasibility, and safety",
      "Worked on the design of a small EMP generator",
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

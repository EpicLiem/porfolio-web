export const about = "I'm Liem Luttrell, an engineering student at Boston University, Class of 2030. I build software, AI tools, and data-driven simulations.";

export const education = {
  school: "Boston University",
  college: "College of Engineering",
  major: "Engineering Undecided",
  graduation: "Expected 2030",
};

export const career = [
  { name: "Honeycake", role: "Software Engineer", period: "February 2025 – present", location: "Philadelphia, PA", lines: ["Built and deployed a Python API on Google Cloud and configured PostgreSQL.", "Developed a customer portal for managing protected files.", "Trained colleagues on code and database workflows.", "Reworked encryption code to improve performance."] },
  { name: "Micropantry", role: "Chief Information Officer", period: "February 2025 – present", location: "", lines: ["Led technical work on a pantry and recipe assistant built with classmates.", "Developed the backend, frontend business logic, and user experience."] },
  { name: "HUMAN Security", role: "Data Analyst Intern", period: "January 2025", location: "New York, NY", lines: ["Investigated suspicious internet traffic using relational databases and identified cash-out domains associated with malicious activity."] },
  { name: "Good-Loop", role: "Software Development Intern", period: "June – August 2024", location: "Edinburgh, UK", lines: ["Built a Python/Playwright web scraper for AI-assisted website classification.", "Worked with self-organizing maps to analyze website features.", "Co-inventor on a U.S. patent application related to this work, filed August 2026."] },
  { name: "Seeds of Fortune", role: "Software Development Intern", period: "June – August 2023", location: "Remote", lines: ["Built a gamified React/Next.js financial simulation to help students plan college budgets, refining the experience through feedback."] },
];

export const contact = {
  email: "liem@epicliem.com",
  github: "https://github.com/epicliem",
  linkedin: "https://www.linkedin.com/in/liem-luttrell/",
  devpost: "https://devpost.com/EpicLiem",
};

export const projects = [
  {
    id: "flowcast",
    name: "Flowcast",
    category: "Campus simulation",
    date: "October 2026",
    summary: "A campus in motion, modeled in 3D.",
    description: [
      "I built Flowcast's data-collection pipeline and most of its campus simulation and incident modeling.",
      "The project models 36,977 synthetic students using BU schedules to explore how events and disruptions affect campus activity.",
      "The collected dataset contains 5,904 Fall 2026 class meetings, including 3,139 in unmapped buildings.",
      "Winner of Best First-Time Hacker at DS+X Hackathon 2026.",
    ],
    links: [
      { label: "Project write-up", href: "https://devpost.com/software/flowcast-0iwt56" },
      { label: "Source code", href: "https://github.com/Darkest-Teddy/Flowcast" },
      { label: "Live demo", href: "https://flowcastmap.com" },
    ],
  },
  {
    id: "notebrew",
    name: "NoteBrew",
    category: "Coffee journal",
    date: "May 12, 2025",
    summary: "A place to remember your next favorite cup.",
    description: [
      "Created and released NoteBrew, an iPhone and iPad coffee journal with searchable brew history, tasting notes, and preference insights.",
      "Launched May 12, 2025. Its Dial In tools help compare attempts and refine brewing settings.",
    ],
    links: [
      { label: "View on the App Store", href: "https://apps.apple.com/us/app/notebrew/id6745646814" },
      { label: "Project website", href: "https://notebrew.epicliem.com" },
      { label: "Privacy policy", href: "/notebrew/privacy-policy.txt" },
    ],
  },
  {
    id: "micropantry",
    name: "Micropantry",
    category: "AI pantry assistant",
    date: "February 2025 onwards",
    summary: "Healthy recipes, starting with what you have.",
    description: [
      "Built with classmates, Micropantry tracks pantry ingredients and recommends personalized healthy recipes using AI.",
      "I wrote the Express backend and deployed it as a Firebase Function, worked on frontend business logic, and refined the user experience.",
      "Winner of the Comcast student competition.",
    ],
    links: [{ label: "Backend source", href: "https://github.com/EpicLiem/micropantrybackend" }],
  },
  {
    id: "emp",
    name: "EMP",
    category: "Independent electronics project",
    date: "Started April 2025",
    summary: "Exploring electromagnetic-pulse concepts.",
    description: [
      "Independent electronics project exploring electromagnetic-pulse concepts, feasibility, and design.",
    ],
    links: [],
  },
];

export type Project = (typeof projects)[number];

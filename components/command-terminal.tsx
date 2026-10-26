"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { about, education, highSchoolCoursework } from "@/lib/portfolio"
import { experiences } from "@/lib/experiences"
import { projects } from "@/lib/projects"

export default function CommandTerminal() {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const commands: Record<string, { description: string; action: () => string }> = {
    help: {
      description: "Show available commands",
      action: () => {
        return Object.entries(commands)
          .map(([cmd, { description }]) => `${cmd.padEnd(12)} - ${description}`)
          .join("\n")
      },
    },
    clear: {
      description: "Clear the terminal",
      action: () => {
        setHistory([])
        return ""
      },
    },
    about: {
      description: "Display information about me",
      action: () => {
        return `
Name: Liem Luttrell
Location: 
Email: liem@epicliem.com
Phone: 

${about}
`
      },
    },
    education: {
      description: "Show my education",
      action: () => {
        return `
${education.map((entry) => [entry.school, entry.program, entry.graduation].filter(Boolean).join(" | ")).join("\n")}
High school coursework: ${highSchoolCoursework.join(", ")}
`
      },
    },
    experience: {
      description: "List my work experience",
      action: () => {
        return experiences.map((experience) => [
          `${experience.company} | ${experience.position} | ${experience.period}`,
          ...experience.description.map((item) => `- ${item}`),
          `Location: ${experience.location}`,
        ].join("\n")).join("\n\n")
      },
    },
    projects: {
      description: "Show my projects",
      action: () => {
        return projects.map((project) => [
          `${project.name} | ${project.date}`,
          ...project.description,
          ...(project.links ?? []).map((link) => `${link.label}: ${link.href}`),
        ].join("\n")).join("\n\n")
      },
    },
    skills: {
      description: "List my skills",
      action: () => {
        return `
Programming Languages: Python, JavaScript, Rust, Java
Tools: GitHub, AWS
Languages: English
Interests: Passion for creating unique designs, and exploring different dishes
`
      },
    },
    contact: {
      description: "Show my contact information",
      action: () => {
        return `
Email: liem@epicliem.com
Phone: 
GitHub: github.com/epicliem
`
      },
    },
    date: {
      description: "Display current date and time",
      action: () => {
        return new Date().toString()
      },
    },
    echo: {
      description: "Echo a message",
      action: () => {
        const args = input.split(" ").slice(1).join(" ")
        return args || "Echo what?"
      },
    },
    ls: {
      description: "List directory contents",
      action: () => {
        return `
about.txt
education.txt
experience.txt
projects.txt
skills.txt
contact.txt
`
      },
    },
    cat: {
      description: "Display file contents",
      action: () => {
        const args = input.split(" ").slice(1)
        const file = args[0]

        if (!file) return "Usage: cat <filename>"

        switch (file) {
          case "about.txt":
            return commands.about.action()
          case "education.txt":
            return commands.education.action()
          case "experience.txt":
            return commands.experience.action()
          case "projects.txt":
            return commands.projects.action()
          case "skills.txt":
            return commands.skills.action()
          case "contact.txt":
            return commands.contact.action()
          default:
            return `File not found: ${file}`
        }
      },
    },
  }

  const handleCommand = () => {
    if (!input.trim()) return

    const newHistory = [...history, `$ ${input}`]
    const commandParts = input.trim().split(" ")
    const command = commandParts[0].toLowerCase()

    if (commands[command]) {
      const output = commands[command].action()
      if (output) {
        newHistory.push(output)
      }
    } else {
      newHistory.push(`Command not found: ${command}. Type 'help' for available commands.`)
    }

    setHistory(newHistory)
    setCommandHistory((prev) => [input, ...prev].slice(0, 10))
    setInput("")
    setHistoryIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(newIndex)
      if (newIndex >= 0 && commandHistory[newIndex]) {
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const newIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(newIndex)
      if (newIndex >= 0 && commandHistory[newIndex]) {
        setInput(commandHistory[newIndex])
      } else {
        setInput("")
      }
    }
  }

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [history])

  useEffect(() => {
    // Initial welcome message
    setHistory([
      "Welcome to Liem's Portfolio Terminal v1.0.0",
      "Type 'help' to see available commands or 'ls' to list files.",
      "",
    ])
  }, [])

  return (
    <div className="overflow-hidden border rounded-md border-amber-800/50 bg-zinc-800/30">
      <div className="flex items-center justify-between p-2 border-b border-amber-800/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm font-bold text-amber-500">Terminal</div>
        <div className="w-16"></div>
      </div>
      <div
        ref={containerRef}
        className="h-64 p-3 overflow-y-auto font-mono text-sm bg-zinc-900/80"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap [overflow-wrap:anywhere] text-amber-200">
            {line}
          </div>
        ))}
        <div className="flex items-center">
          <span className="mr-2 text-amber-500">$</span>
          <input
            ref={inputRef}
            type="text"
            aria-label="Terminal command"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none text-amber-200"
            autoFocus
          />
          <div className="w-2 h-5 ml-px bg-amber-500 animate-[blink_1s_step-end_infinite]"></div>
        </div>
      </div>
    </div>
  )
}

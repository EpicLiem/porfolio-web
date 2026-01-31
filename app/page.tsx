"use client"

import type React from "react"
import Link from "next/link"

import { useState, useEffect, useRef } from "react"
import { toast, Toaster } from "sonner"
import { Terminal } from "lucide-react"
import CommandTerminal from "@/components/command-terminal"
import SystemWindow from "@/components/system-window"
import NetworkStats from "@/components/network-stats"
import SystemInfo from "@/components/system-info"
import ProjectsList from "@/components/projects-list"
import ExperienceLog from "@/components/experience-log"
import SkillsMatrix from "@/components/skills-matrix"
import ContactTerminal from "@/components/contact-terminal"
import Guestbook from "@/components/guestbook"
import { sendContactMessage, type ContactFormState } from "./actions"

export default function Home() {
  const [activeSection, setActiveSection] = useState("home")
  const [bootSequenceComplete, setBootSequenceComplete] = useState(true)

  return (
    <div className="min-h-screen font-mono bg-zinc-900 text-amber-100">
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              `group toast
               bg-zinc-900 border border-solid shadow-lg font-mono rounded-sm
               border-zinc-700 text-amber-100
               data-[type=success]:border-amber-500 data-[type=success]:text-amber-400
               data-[type=error]:border-red-500 data-[type=error]:text-red-400`,
            icon:
              `[&>svg]:text-amber-100
               group-[[data-type=success]_&_>svg]:text-amber-400
               group-[[data-type=error]_&_>svg]:text-red-400`,
            description: "text-amber-200 font-mono",
            actionButton:
              "bg-amber-500 text-zinc-900 font-mono",
            cancelButton:
              "bg-zinc-700 text-zinc-200 font-mono",
          },
        }}
      />
      <header className="sticky top-0 z-50 border-b border-amber-800 bg-zinc-900">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-500" />
            <span className="text-lg font-bold text-amber-500">liem@portfolio:~$</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-2 py-1 text-xs border rounded border-amber-800 text-amber-400">v1.0.0</div>
          </div>
        </div>
      </header>

      <nav className="border-b border-zinc-800 bg-zinc-800/30">
        <div className="container px-4 mx-auto">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            <NavButton
              active={activeSection === "home"}
              onClick={() => setActiveSection("home")}
              icon={
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
                  className="w-4 h-4"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              }
              label="Home"
            />
            <NavButton
              active={activeSection === "experience"}
              onClick={() => setActiveSection("experience")}
              icon={
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
                  className="w-4 h-4"
                >
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              }
              label="Experience"
            />
            <NavButton
              active={activeSection === "projects"}
              onClick={() => setActiveSection("projects")}
              icon={
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
                  className="w-4 h-4"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" x2="12" y1="11" y2="17" />
                  <line x1="9" x2="15" y1="14" y2="14" />
                </svg>
              }
              label="Projects"
            />
            <NavButton
              active={activeSection === "skills"}
              onClick={() => setActiveSection("skills")}
              icon={
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
                  className="w-4 h-4"
                >
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 2v2" />
                  <path d="M12 22v-2" />
                  <path d="m17 20.66-1-1.73" />
                  <path d="M11 10.27 7 3.34" />
                  <path d="m20.66 17-1.73-1" />
                  <path d="m3.34 7 1.73 1" />
                  <path d="M14 12h8" />
                  <path d="M2 12h2" />
                </svg>
              }
              label="Skills"
            />
            <NavButton
              active={activeSection === "contact"}
              onClick={() => setActiveSection("contact")}
              icon={
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
                  className="w-4 h-4"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              }
              label="Contact"
            />
            <NavButton
              active={activeSection === "guestbook"}
              onClick={() => setActiveSection("guestbook")}
              icon={
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
                  className="w-4 h-4"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              }
              label="Leave a Message"
            />
            <Link href="/blog" passHref legacyBehavior>
              <a
                className={`flex items-center px-3 py-2 space-x-2 text-sm font-medium rounded-t transition-colors ${
                  false
                    ? "bg-zinc-900 text-amber-100 border-b-2 border-amber-500"
                    : "text-amber-400 hover:bg-zinc-700/50 hover:text-amber-200"
                }`}
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
                  className="w-4 h-4"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                <span>Blog</span>
              </a>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container px-4 py-6 mx-auto">
        {activeSection === "home" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <CommandTerminal />
              <SystemWindow title="About Liem Luttrell">
                <div className="space-y-4 text-amber-200">
                  <p>
                    Welcome! I'm Liem, a Senior at Germantown Friends School with a deep passion for software development, AI, and leveraging technology for impact.
                  </p>
                  <p>
                    My current relevant coursework includes CS 1-3, CS Capstone, and Differential Calculus. I'm constantly exploring new areas, from building web applications and AI models to experimenting with hardware like EMP generators.
                  </p>
                  <p>
                    I thrive in dynamic environments, enjoy tackling complex problems, and have experience across the full development lifecycle, from backend development and DevOps in the cloud (AWS, GCP) to frontend implementation (React, Next.js) and data analysis. I'm also proficient in Python, JavaScript, Rust, and Java.
                  </p>
                  <p>
                    Explore my projects and experience below, check out my blog, or feel free to connect!
                  </p>
                </div>
              </SystemWindow>
            </div>
            <div className="space-y-6">
              <NetworkStats />
              <SystemInfo />
            </div>
          </div>
        )}

        {activeSection === "projects" && <ProjectsList />}
        {activeSection === "experience" && <ExperienceLog />}
        {activeSection === "skills" && <SkillsMatrix />}
        {activeSection === "contact" && (
          <div className="space-y-6">
            <SystemWindow title="Contact Information">
              <div className="p-2 text-amber-200">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-16 text-amber-400 shrink-0 text-right">Email:</span>
                    <span>liem@epicliem.com</span>
                  </div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-16 text-amber-400 shrink-0 text-right">Phone:</span>
                    <span>+1 (267)-800-4362</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-amber-400 shrink-0 text-right">GitHub:</span>
                    <a 
                      href="https://github.com/epicliem" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-amber-300 hover:underline"
                    >
                      github.com/epicliem
                    </a>
                  </div>
              </div>
            </SystemWindow>

            <SystemWindow title="Contact Terminal">
              <div className="p-4 border rounded-md border-amber-800/50 bg-zinc-800/30 min-h-[300px] h-[400px] flex flex-col">
                <ContactTerminal />
              </div>
            </SystemWindow>
          </div>
        )}
        {activeSection === "guestbook" && <Guestbook />}
      </main>

      <footer className="py-4 mt-8 border-t border-zinc-800 bg-zinc-900">
        <div className="container flex flex-col items-center justify-between px-4 mx-auto space-y-2 md:flex-row md:space-y-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Portfolio v1.0.0</span>
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
              className="w-3 h-3 text-green-500"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/epicliem"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-amber-500"
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
                className="w-4 h-4"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span className="sr-only">GitHub</span>
            </a>
          </div>
          <div className="text-xs text-zinc-500">Made with passion by Liem Luttrell</div>
        </div>
      </footer>
    </div>
  )
}

interface NavButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 flex items-center gap-2 transition-colors ${
        active
          ? "text-amber-500 border-b-2 border-amber-500"
          : "text-zinc-400 hover:text-amber-300 hover:border-b-2 hover:border-amber-300/50"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

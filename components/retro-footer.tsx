import Link from "next/link"
import { Github, Linkedin, Mail, FileText } from "lucide-react"

export default function RetroFooter() {
  return (
    <footer className="py-12 border-t-4 border-amber-900 bg-amber-100">
      <div className="container px-4 mx-auto">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 font-serif text-xl font-bold">Portfolio</h3>
            <p className="mb-4 text-amber-800">
              Crafting unique digital experiences with a touch of nostalgia and a passion for detail.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-900 hover:text-amber-700"
              >
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-900 hover:text-amber-700"
              >
                <Linkedin className="w-5 h-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="mailto:hello@example.com" className="text-amber-900 hover:text-amber-700">
                <Mail className="w-5 h-5" />
                <span className="sr-only">Email</span>
              </Link>
              <Link href="/resume.pdf" target="_blank" className="text-amber-900 hover:text-amber-700">
                <FileText className="w-5 h-5" />
                <span className="sr-only">Resume</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-xl font-bold">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-amber-900 hover:text-amber-700 hover:underline">
                Home
              </Link>
              <Link href="/#about" className="text-amber-900 hover:text-amber-700 hover:underline">
                About
              </Link>
              <Link href="/#work" className="text-amber-900 hover:text-amber-700 hover:underline">
                Work
              </Link>
              <Link href="/blog" className="text-amber-900 hover:text-amber-700 hover:underline">
                Blog
              </Link>
              <Link href="/#contact" className="text-amber-900 hover:text-amber-700 hover:underline">
                Contact
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-xl font-bold">Newsletter</h3>
            <p className="mb-4 text-amber-800">Subscribe to receive updates on new projects and blog posts.</p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-3 py-2 border-2 rounded-md border-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-700"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 font-medium text-amber-50 transition-colors rounded-md bg-amber-900 hover:bg-amber-800"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 mt-8 text-center border-t-2 border-amber-200">
          <p className="text-amber-800">&copy; {new Date().getFullYear()} Portfolio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

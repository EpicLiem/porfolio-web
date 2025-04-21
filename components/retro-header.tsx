import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function RetroHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-amber-900 bg-amber-50">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link href="/" className="font-serif text-2xl font-bold">
          Portfolio
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-6">
          <Link href="/" className="font-medium text-amber-900 hover:text-amber-700">
            Home
          </Link>
          <Link href="/#about" className="font-medium text-amber-900 hover:text-amber-700">
            About
          </Link>
          <Link href="/#work" className="font-medium text-amber-900 hover:text-amber-700">
            Work
          </Link>
          <Link href="/blog" className="font-medium text-amber-900 hover:text-amber-700">
            Blog
          </Link>
          <Link href="/#contact" className="font-medium text-amber-900 hover:text-amber-700">
            Contact
          </Link>
        </nav>

        <div className="hidden md:block">
          <Button className="text-amber-50 bg-amber-900 hover:bg-amber-800">Hire Me</Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-amber-50 border-l-4 border-amber-900">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="text-lg font-medium text-amber-900 hover:text-amber-700">
                Home
              </Link>
              <Link href="/#about" className="text-lg font-medium text-amber-900 hover:text-amber-700">
                About
              </Link>
              <Link href="/#work" className="text-lg font-medium text-amber-900 hover:text-amber-700">
                Work
              </Link>
              <Link href="/blog" className="text-lg font-medium text-amber-900 hover:text-amber-700">
                Blog
              </Link>
              <Link href="/#contact" className="text-lg font-medium text-amber-900 hover:text-amber-700">
                Contact
              </Link>
              <Button className="mt-4 text-amber-50 bg-amber-900 hover:bg-amber-800">Hire Me</Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

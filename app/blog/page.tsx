import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import BlogPostCard from "@/components/blog-post-card"
import RetroHeader from "@/components/retro-header"
import RetroFooter from "@/components/retro-footer"

export default function BlogPage() {
  // This would typically come from a CMS or database
  const blogPosts = [
    {
      title: "The Revival of Retro Design in Modern Web",
      excerpt: "Exploring how vintage aesthetics are making a comeback in contemporary digital design.",
      date: "April 15, 2023",
      category: "Design",
      slug: "revival-of-retro-design",
    },
    {
      title: "Building Accessible Interfaces",
      excerpt: "Best practices for creating web experiences that work for everyone, regardless of ability.",
      date: "March 22, 2023",
      category: "Development",
      slug: "building-accessible-interfaces",
    },
    {
      title: "Color Theory for Digital Designers",
      excerpt: "Understanding the psychology of color and how to effectively use it in your projects.",
      date: "February 10, 2023",
      category: "Design",
      slug: "color-theory-digital-designers",
    },
    {
      title: "The Future of JavaScript Frameworks",
      excerpt: "Predictions and trends for the evolution of frontend development tools.",
      date: "January 28, 2023",
      category: "Development",
      slug: "future-javascript-frameworks",
    },
    {
      title: "Typography Fundamentals Every Designer Should Know",
      excerpt: "Essential principles of typography that can elevate your design work.",
      date: "December 12, 2022",
      category: "Design",
      slug: "typography-fundamentals",
    },
    {
      title: "Creating Performant Animations for the Web",
      excerpt: "Techniques for building smooth, efficient animations that don't sacrifice performance.",
      date: "November 5, 2022",
      category: "Development",
      slug: "performant-animations-web",
    },
  ]

  const categories = ["All", "Design", "Development", "Career", "Tools"]

  return (
    <div className="min-h-screen bg-amber-50 text-amber-900">
      <RetroHeader />

      <div className="container px-4 py-12 mx-auto md:py-16">
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-amber-900 hover:bg-amber-200 hover:text-amber-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="mb-4 font-serif text-5xl font-bold">The Blog</h1>
          <p className="text-lg text-amber-800">
            Thoughts, stories and ideas about design, development, and creative work.
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  className={
                    category === "All"
                      ? "bg-amber-900 text-amber-50 hover:bg-amber-800"
                      : "border-amber-900 text-amber-900 hover:bg-amber-200 hover:text-amber-900"
                  }
                >
                  {category}
                </Badge>
              ))}
            </div>
            <div className="w-full md:w-64">
              <Input
                type="search"
                placeholder="Search articles..."
                className="border-amber-900 focus-visible:ring-amber-700"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogPostCard
              key={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              date={post.date}
              category={post.category}
              slug={post.slug}
            />
          ))}
        </div>
      </div>

      <RetroFooter />
    </div>
  )
}

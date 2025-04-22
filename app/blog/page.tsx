import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import BlogPostCard from "@/components/blog-post-card"
import SystemWindow from "@/components/system-window"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

interface PostData {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  image: string
}

// Function to get posts from MDX files
function getBlogPosts(): PostData[] {
  const postsDirectory = path.join(process.cwd(), "content/blog")
  let filenames: string[] = []
  try {
    filenames = fs.readdirSync(postsDirectory)
  } catch (error) {
    console.error("Could not read blog directory:", postsDirectory, error)
    return [] // Return empty if directory doesn't exist or error occurs
  }

  const mdxFiles = filenames.filter((filename) => filename.endsWith(".mdx"))

  const posts = mdxFiles.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "")
    const filePath = path.join(postsDirectory, filename)
    const fileContents = fs.readFileSync(filePath, "utf8")
    const { data } = matter(fileContents) // data contains the frontmatter

    // Basic validation/defaults
    return {
      slug,
      title: data.title || "Untitled Post",
      excerpt: data.excerpt || "",
      date: data.date ? new Date(data.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "No Date",
      category: data.category || "Uncategorized",
      image: data.image || undefined, // Changed default from placeholder string to undefined
    }
  })

  // Optional: Sort posts by date (descending)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts
}

export default function BlogPage() {
  const blogPosts = getBlogPosts()

  // Keep categories logic for now, could be derived from posts later
  const categories = ["All", "Design", "Development", "Career", "Tools"]

  return (
    <div className="min-h-screen font-mono bg-zinc-900 text-amber-100">
      <div className="container px-4 py-12 mx-auto md:py-16">
        <Link href="/">
          <button className="inline-flex items-center px-3 py-1 mb-6 text-sm border rounded border-amber-800 text-amber-400 hover:bg-amber-800/30 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </button>
        </Link>

        <div className="mb-8">
          <SystemWindow title="blog:~$" >
            <div className="max-w-3xl mx-auto mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold text-amber-400 md:text-5xl">The Blog</h1>
              <p className="text-lg text-amber-200">
                Thoughts, stories and ideas about design, development, and creative work.
              </p>
            </div>
          </SystemWindow>
        </div>

        <SystemWindow title="posts:~$" >
          <div className="max-w-5xl p-4 mx-auto">
            {blogPosts.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map((post) => (
                  <BlogPostCard
                    key={post.slug}
                    title={post.title}
                    excerpt={post.excerpt}
                    date={post.date} // Use formatted date
                    category={post.category}
                    slug={post.slug} // Use slug from file
                    image={post.image} // Use image from frontmatter or default
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-amber-300">No blog posts found.</p>
            )}
          </div>
        </SystemWindow>
      </div>
    </div>
  )
}

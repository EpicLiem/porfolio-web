import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, User, Tag } from "lucide-react"
import SystemWindow from "@/components/system-window"
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { compileMDX } from "next-mdx-remote/rsc"

// --- Added Helper Functions --- 
// Simple hash function
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Generate HSL color string
function generateHslColor(hash: number, offset: number): string {
  const hue = (hash + offset) % 360;
  const saturation = 40;
  const lightness = 35; 
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
// --- End Helper Functions ---

// Helper function to get MDX file paths and slugs
function getPostSlugs() {
  const postsDirectory = path.join(process.cwd(), "content/blog")
  try {
    const filenames = fs.readdirSync(postsDirectory)
    return filenames
      .filter((filename) => filename.endsWith(".mdx"))
      .map((filename) => filename.replace(/\.mdx$/, ""))
  } catch (error) {
    console.error("Could not read blog directory for slugs:", postsDirectory, error)
    return []
  }
}

// Generate static paths for each blog post
export async function generateStaticParams() {
  const slugs = getPostSlugs()
  return slugs.map((slug) => ({
    slug: slug,
  }))
}

// Function to fetch and compile a single post
async function getPostBySlug(slug: string) {
  const postsDirectory = path.join(process.cwd(), "content/blog")
  const filePath = path.join(postsDirectory, `${slug}.mdx`)

  try {
    const fileContents = fs.readFileSync(filePath, "utf8")
    const { content, data } = matter(fileContents)

    // Compile the MDX content
    const { content: compiledContent } = await compileMDX<{
      title: string
      date: string
      author: string
      category?: string
      authorImage?: string
      featuredImage?: string
      tags?: string[] // Added tags type
    }>({
      source: content,
      options: { parseFrontmatter: false }, // We already parsed it with gray-matter
      // You can pass components here if you want to use custom React components in MDX
      // components: { MyCustomComponent },
    })

    // Return the compiled content AND the frontmatter parsed by gray-matter
    return { compiledContent, frontmatter: data as any } // Using `as any` temporarily if types conflict, ensure data structure matches expected frontmatter
  } catch (error) {
    console.error(`Error reading or compiling MDX file for slug ${slug}:`, error)
    return null // Handle case where file doesn't exist or compilation fails
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  const postData = await getPostBySlug(slug)

  if (!postData) {
    // Handle post not found - maybe redirect or show a 404 component
    // For now, just show a simple message
    return (
      <div className="min-h-screen font-mono bg-zinc-900 text-amber-100">
        <div className="container px-4 py-12 mx-auto md:py-16 text-center">
          <p>Blog post not found.</p>
          <Link href="/blog" className="mt-4 inline-block text-amber-400 hover:text-amber-200">
            &larr; Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const { compiledContent, frontmatter } = postData

  // --- Generate gradient for featured image if needed ---
  let featuredImageGradientStyle = {};
  if (!frontmatter.featuredImage) {
    const hash = simpleHash(frontmatter.title || slug);
    const color1 = generateHslColor(hash, 0);
    const color2 = generateHslColor(hash, 60);
    featuredImageGradientStyle = {
      background: `linear-gradient(135deg, ${color1}, ${color2})`,
    };
  }
  // --- End gradient generation ---

  // Format date if needed
  const formattedDate = frontmatter.date
    ? new Date(frontmatter.date).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : "No Date"

  return (
    <div className="min-h-screen font-mono bg-zinc-900 text-amber-100">
      <div className="container px-4 py-12 mx-auto md:py-16">
        <Link href="/blog" className="inline-block mb-8">
          <button className="inline-flex items-center px-3 py-1 text-sm border rounded border-amber-800 text-amber-400 hover:bg-amber-800/30 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </button>
        </Link>

        <SystemWindow title={`blog/${slug}.mdx:~$`}>
          <article className="p-6">
            <div className="max-w-3xl mx-auto">
              {frontmatter.category && (
                <div className="flex items-center mb-4 text-sm text-amber-400">
                  <Tag className="w-4 h-4 mr-2" />
                  <span>{frontmatter.category}</span>
                </div>
              )}

              <h1 className="mb-6 text-3xl font-bold text-amber-300 md:text-4xl">{frontmatter.title}</h1>

              <div className="flex items-center gap-4 mb-8 text-sm border-b border-dashed pb-6 border-amber-800/50 text-amber-400">
                {frontmatter.author && (
                  <div className="flex items-center gap-2">
                    {frontmatter.authorImage && (
                      <Image
                        src={frontmatter.authorImage}
                        alt={frontmatter.author}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <User className={`w-4 h-4 ${frontmatter.authorImage ? 'hidden' : ''}`} />
                    <span>{frontmatter.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                   <Calendar className="w-4 h-4" />
                   <time dateTime={frontmatter.date}>{formattedDate}</time>
                </div>
              </div>

              <div className="relative mb-10 overflow-hidden border rounded border-amber-800/50 aspect-video">
                {frontmatter.featuredImage && frontmatter.featuredImage.trim() !== '' ? (
                   <Image
                    src={frontmatter.featuredImage}
                    alt={`${frontmatter.title} featured image`}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                   />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={featuredImageGradientStyle}
                  >
                     {/* Optional fallback content */}
                  </div>
                )}
              </div>

              <div className="prose prose-retro max-w-none">
                {compiledContent}
              </div>

              {frontmatter.tags && frontmatter.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-dashed border-amber-800/50">
                  <span className="mr-2 text-amber-400">Tags:</span>
                  {frontmatter.tags.map((tag: string) => (
                    <span key={tag} className="inline-block px-2 py-0.5 mr-2 text-xs border rounded border-amber-700 bg-amber-800/30 text-amber-300">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        </SystemWindow>

        {/* Optional: Add related posts logic based on frontmatter tags/categories */}
      </div>
    </div>
  )
}

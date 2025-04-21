import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import RetroHeader from "@/components/retro-header"
import RetroFooter from "@/components/retro-footer"

export default function BlogPost({ params }: { params: { slug: string } }) {
  // In a real app, you would fetch the blog post data based on the slug
  const post = {
    title: "The Revival of Retro Design in Modern Web",
    date: "April 15, 2023",
    category: "Design",
    author: "Jane Smith",
    authorImage: "/placeholder.svg?height=100&width=100",
    content: `
      <p>In recent years, we've seen a significant resurgence of retro design elements in modern web design. This nostalgic trend isn't just about looking backward—it's about combining the best aesthetic elements of the past with contemporary functionality and user experience principles.</p>
      
      <h2>Why Retro Design is Making a Comeback</h2>
      
      <p>In an increasingly digital world, users are drawn to designs that feel tangible, authentic, and human. Retro design elements provide a sense of familiarity and warmth that can be lacking in ultra-modern, minimalist interfaces.</p>
      
      <p>The appeal of retro design lies in its ability to evoke emotion through:</p>
      
      <ul>
        <li>Rich textures and patterns that add depth</li>
        <li>Warm color palettes that feel inviting</li>
        <li>Typography with character and personality</li>
        <li>Playful illustrations that add a human touch</li>
      </ul>
      
      <h2>Balancing Nostalgia with Usability</h2>
      
      <p>The challenge for designers is incorporating these vintage elements without sacrificing the usability and performance standards of modern web design. The most successful retro-inspired designs maintain a careful balance:</p>
      
      <p>They embrace vintage aesthetics while ensuring interfaces remain intuitive and accessible. They incorporate texture and detail without overwhelming users or impacting page load times. They use nostalgic elements purposefully, not just as decoration.</p>
      
      <h2>Case Studies: Retro Done Right</h2>
      
      <p>Several brands have successfully implemented retro design elements in their digital presence. Spotify's annual Wrapped feature uses color schemes and typography reminiscent of different eras to enhance its nostalgic appeal. Poolside FM combines a 1980s computer interface with modern functionality to create a unique user experience.</p>
      
      <h2>Looking Forward by Looking Back</h2>
      
      <p>As we continue to advance technologically, the human desire for connection and nostalgia remains constant. The revival of retro design isn't just a passing trend—it's a reflection of our ongoing relationship with the past and how it shapes our vision of the future.</p>
      
      <p>For designers looking to incorporate retro elements into their work, the key is understanding the "why" behind these aesthetic choices. When retro design serves a purpose—whether creating emotional connection, establishing brand identity, or enhancing storytelling—it transcends mere nostalgia and becomes a powerful tool in the modern designer's toolkit.</p>
    `,
    relatedPosts: [
      {
        title: "Color Theory for Digital Designers",
        slug: "color-theory-digital-designers",
      },
      {
        title: "Typography Fundamentals Every Designer Should Know",
        slug: "typography-fundamentals",
      },
    ],
  }

  return (
    <div className="min-h-screen bg-amber-50 text-amber-900">
      <RetroHeader />

      <article className="container px-4 py-12 mx-auto md:py-16">
        <Link href="/blog">
          <Button variant="ghost" className="mb-6 text-amber-900 hover:bg-amber-200 hover:text-amber-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Button>
        </Link>

        <div className="max-w-3xl mx-auto">
          <Badge className="mb-4 bg-amber-200 text-amber-900 hover:bg-amber-300">{post.category}</Badge>

          <h1 className="mb-4 font-serif text-4xl font-bold md:text-5xl">{post.title}</h1>

          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-10 h-10 overflow-hidden rounded-full">
              <Image src={post.authorImage || "/placeholder.svg"} alt={post.author} fill className="object-cover" />
            </div>
            <div>
              <p className="font-medium">{post.author}</p>
              <p className="text-sm text-amber-700">{post.date}</p>
            </div>
          </div>

          <div className="relative mb-10 overflow-hidden rounded-lg aspect-video">
            <Image
              src="/placeholder.svg?height=600&width=1200"
              alt="Blog post featured image"
              fill
              className="object-cover"
            />
          </div>

          <div
            className="prose prose-amber max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:text-amber-800 prose-li:text-amber-800"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-16 border-t-2 border-amber-200 pt-8">
            <h3 className="mb-6 font-serif text-2xl font-bold">Related Articles</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {post.relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="p-6 transition-colors border-2 border-amber-200 rounded-lg hover:border-amber-300 hover:bg-amber-100"
                >
                  <h4 className="font-medium">{relatedPost.title}</h4>
                  <p className="mt-2 text-sm text-amber-700">Read article →</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>

      <RetroFooter />
    </div>
  )
}

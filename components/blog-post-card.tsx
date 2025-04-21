import Link from "next/link"
import Image from "next/image"
import { Calendar, Tag } from "lucide-react"

// Simple hash function (optional, for deterministic gradients)
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
  // Using amber-ish theme colors: low saturation, moderate lightness
  const saturation = 40;
  const lightness = 35; 
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

interface BlogPostCardProps {
  title: string
  excerpt: string
  date: string
  category: string
  slug: string
  image?: string
}

export default function BlogPostCard({ title, excerpt, date, category, slug, image }: BlogPostCardProps) {
  // Generate gradient colors if no image
  let gradientStyle = {};
  if (!image) {
    const hash = simpleHash(title);
    const color1 = generateHslColor(hash, 0);
    const color2 = generateHslColor(hash, 60); // Offset hue for second color
    gradientStyle = {
      background: `linear-gradient(135deg, ${color1}, ${color2})`,
    };
  }

  return (
    <div className="flex flex-col overflow-hidden border rounded border-amber-800/50 bg-zinc-800/30 hover:border-amber-700 transition-colors duration-200">
      <Link href={`/blog/${slug}`} className="block aspect-video relative overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={`${title} blog post illustration`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={gradientStyle}
          >
            {/* Optional: Add a subtle pattern or icon here */}
            {/* <span className="text-amber-600 text-opacity-50 text-4xl">&#x263C;</span> */}
          </div>
        )}
      </Link>
      <div className="flex-grow p-4 space-y-3">
        <div className="flex items-center text-xs text-amber-400">
          <Tag className="w-3 h-3 mr-1.5" />
          <span>{category}</span>
        </div>
        <Link href={`/blog/${slug}`}>
          <h3 className="text-lg font-semibold text-amber-300 transition-colors hover:text-amber-200">{title}</h3>
        </Link>
        <p className="text-sm text-amber-200/80 line-clamp-3">{excerpt}</p>
      </div>
      <div className="flex items-center p-4 pt-0 mt-auto text-xs text-amber-500">
        <Calendar className="w-3 h-3 mr-1.5" />
        <time dateTime={date}>{date}</time>
      </div>
    </div>
  )
}

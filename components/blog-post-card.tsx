import Link from "next/link"
import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface BlogPostCardProps {
  title: string
  excerpt: string
  date: string
  category: string
  slug: string
}

export default function BlogPostCard({ title, excerpt, date, category, slug }: BlogPostCardProps) {
  return (
    <Card className="overflow-hidden transition-all border-2 border-amber-900 hover:shadow-[4px_4px_0px_0px_rgba(120,53,15,1)]">
      <CardContent className="p-6">
        <Badge className="mb-3 bg-amber-200 text-amber-900 hover:bg-amber-300">{category}</Badge>
        <Link href={`/blog/${slug}`}>
          <h3 className="mb-2 text-xl font-bold transition-colors hover:text-amber-700">{title}</h3>
        </Link>
        <p className="mb-4 text-amber-800">{excerpt}</p>
      </CardContent>
      <CardFooter className="flex items-center p-6 pt-0">
        <div className="flex items-center text-sm text-amber-700">
          <Calendar className="w-4 h-4 mr-2" />
          <time dateTime={date}>{date}</time>
        </div>
      </CardFooter>
    </Card>
  )
}

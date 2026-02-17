import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'
import { getBlogs } from '@/lib/data/blog'
import { getMarkdownFile, extractToc } from '@/lib/markdown'
import { TableOfContents } from '@/components/table-of-contents'
import { Pre } from '@/components/pre'

import { MarkdownBody } from '@/components/markdown-body'

export async function generateStaticParams() {
  const blogData = await getBlogs()
  return blogData.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blogData = await getBlogs()
  const post = blogData.find(p => p.slug === slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blogData = await getBlogs()
  const post = blogData.find(p => p.slug === slug)

  if (!post) {
    notFound()
  }

  const file = await getMarkdownFile('content/blog', slug)
  if (!file) {
    notFound()
  }

  const toc = extractToc(file.content)

  return (
    <div className="min-h-screen flex items-start">
      <div className="w-full px-4 py-12 md:py-16 mx-auto max-w-6xl">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            <article className="max-w-none">
              <div className="mb-8">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                  {file.data.title || post.title}
                </h1>

                {file.data.description && (
                  <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                    {file.data.description}
                  </p>
                )}

                <div className="flex items-center gap-6 flex-wrap text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={file.data.date || post.date}>
                      {new Date(file.data.date || post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  {file.data.readTime && (
                    <div className="flex items-center gap-2">
                      <span>{file.data.readTime} min read</span>
                    </div>
                  )}
                </div>

                {file.data.tags && file.data.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {file.data.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="hover:bg-secondary/80 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Card className="border">
                <CardContent className="p-0">
                  <MarkdownBody content={file.content} className="p-8" />
                </CardContent>
              </Card>
            </article>
          </div>

          <TableOfContents toc={toc} />
        </div>
      </div>
    </div>
  )
}

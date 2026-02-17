import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Clock } from 'lucide-react'
import { getBlogs } from '@/lib/data/blog'
import { AnimatedSection } from '@/components/animated/AnimatedSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Research Blog from Jiawen Zou',
  description: 'Insights, tutorials, and research notes from our team',
}

export default async function BlogPage() {
  const blogData = await getBlogs()

  return (
    <div className="min-h-screen flex items-start">
      <div className="w-full px-4 py-12 md:py-16 mx-auto max-w-5xl">
        <AnimatedSection distance={40} duration={0.6} delay={0}>
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Research Blog
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Insights, tutorials, and research notes from our team
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection distance={50} stagger={0.1} delay={0.2} duration={0.7}>
          <div className="grid gap-8 md:grid-cols-2">
            {blogData.map((post) => (
              <Link
                key={post.id}
                href={post.slug ? `/blog/${post.slug}` : '#'}
                className="group"
              >
                <Card
                  className={`h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${post.featured ? 'border border-primary ring-2 ring-primary/20' : ''}`}
                >
                  <CardHeader className="space-y-4">
                    {post.featured && (
                      <Badge className="w-fit bg-gradient-to-r from-primary to-primary/80">
                        Featured Post
                      </Badge>
                    )}
                    <div className="space-y-3">
                      <CardTitle className="text-xl md:text-2xl group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="leading-relaxed text-base">
                        {post.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="hover:bg-accent transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t space-y-2 sm:space-y-0 sm:flex-row flex-col sm:flex-col text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime} min read</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}

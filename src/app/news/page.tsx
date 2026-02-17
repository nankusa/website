import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Tag } from 'lucide-react'
import { getNews } from '@/lib/data/news'
import { AnimatedSection } from '@/components/animated/AnimatedSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Latest News from Jiawen Zou',
  description: 'Stay updated with latest announcements from Jiawen Zou.',
}

export default async function NewsPage() {
  const newsData = await getNews()

  return (
    <div className="min-h-screen flex items-start">
      <div className="w-full px-4 py-12 md:py-16 mx-auto max-w-5xl">
        <AnimatedSection distance={40} duration={0.6} delay={0}>
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Latest News
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Stay updated with latest announcements from our research
              laboratory
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection distance={50} stagger={0.1} delay={0.2} duration={0.7}>
          <div className="grid gap-8 md:grid-cols-2">
            {newsData.map((news) => {
              const CardWrapper = news.linkUrl ? Link : 'div'
              return (
                <CardWrapper
                  key={news.id}
                  href={news.linkUrl || '#'}
                  className="group"
                >
                  <Card
                    className={`h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${news.featured ? 'border border-primary ring-2 ring-primary/20' : ''}`}
                  >
                    <CardHeader className="space-y-3">
                      {news.featured && (
                        <Badge className="w-fit bg-gradient-to-r from-primary to-primary/80">
                          Featured Post
                        </Badge>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-xl md:text-2xl flex-1 group-hover:text-primary transition-colors">
                          {news.title}
                        </CardTitle>
                        {news.category && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            {news.category}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="leading-relaxed text-base">
                        {news.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* <p className="text-muted-foreground leading-relaxed">
                        {news.content}
                      </p> */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        {news.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="hover:bg-accent transition-colors"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={news.date}>
                          {new Date(news.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                    </CardContent>
                  </Card>
                </CardWrapper>
              )
            })}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}

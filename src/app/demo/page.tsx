import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Tag, ArrowRight } from 'lucide-react'
import { getDemos } from '@/lib/data/demo'
import { AnimatedSection } from '@/components/animated/AnimatedSection'

export default async function DemoPage() {
  const demoData = await getDemos()

  return (
    <div className="min-h-screen flex items-start">
      <div className="w-full px-4 py-12 md:py-16 mx-auto max-w-6xl">
        <AnimatedSection distance={40} duration={0.6} delay={0}>
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Interactive Demos
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore our research through interactive demonstrations
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection distance={50} stagger={0.1} delay={0.2} duration={0.7}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demoData.map((demo) => (
              <Link
                key={demo.id}
                href={demo.slug ? `/demo/${demo.slug}` : '#'}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--nord10)] to-[var(--nord9)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <ArrowRight className="w-6 h-6 text-[var(--nord6)]" />
                    </div>
                    <div className="space-y-3">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {demo.title}
                      </CardTitle>
                      <CardDescription className="leading-relaxed text-base">
                        {demo.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">
                      {demo.content}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      {demo.tags.map((tag) => (
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
                      <time dateTime={demo.date}>
                        {new Date(demo.date).toLocaleDateString('en-US', {
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

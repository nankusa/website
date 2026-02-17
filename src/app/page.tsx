import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Newspaper, BookOpen, FileText, Play, ArrowRight } from 'lucide-react'
import { AnimatedSection, TypewriterHeading } from '@/components/animated/AnimatedSection'

const sections = [
  {
    href: '/news',
    icon: Newspaper,
    title: 'News',
    description:
      'Latest updates and announcements from Jiawen Zou.',
    gradient: 'from-[var(--nord10)] to-[var(--nord9)]',
  },
  {
    href: '/blog',
    icon: BookOpen,
    title: 'Blog',
    description: 'Insights and tutorials from our research team',
    gradient: 'from-[var(--nord14)] to-[var(--nord7)]',
  },
  {
    href: '/papers',
    icon: FileText,
    title: 'Papers',
    description: 'Our published research and conference presentations',
    gradient: 'from-[var(--nord15)] to-[var(--nord11)]',
  },
  {
    href: '/demo',
    icon: Play,
    title: 'Demo',
    description: 'Interactive demonstrations of our research',
    gradient: 'from-[var(--nord12)] to-[var(--nord13)]',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen flex items-center">
      <div className="w-full px-4 py-16 md:py-24 mx-auto max-w-6xl">
        <div className="text-center space-y-6 mb-16">
          <TypewriterHeading
            text="Welcome to JWZou's Lab"
            speed={80}
            delay={300}
            className="text-5xl md:text-6xl font-bold tracking-tight min-h-[1.2em]"
          />
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mx-auto max-w-2xl">
            Explore our research through news, blog posts, publications, and
            interactive demos
          </p>
        </div>

        <AnimatedSection distance={60} stagger={0.1} delay={0.3} duration={0.6}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mx-auto">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <Link key={section.href} href={section.href} className="group">
                  <Card className="h-full border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
                    <CardHeader className="space-y-4 flex-1">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-7 h-7 text-[var(--nord6)]" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {section.title}
                        </CardTitle>
                        <CardDescription className="leading-relaxed">
                          {section.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <Button
                        variant="ghost"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      >
                        Explore {section.title}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}

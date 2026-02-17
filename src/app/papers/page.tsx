import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, ExternalLink, Quote, Play, FileText } from 'lucide-react'
import { getPapersData } from '@/lib/actions/papers'
import { AnimatedSection } from '@/components/animated/AnimatedSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publications from Jiawen Zou',
  description: 'Browse our published research and conference presentations',
}

export default async function PapersPage() {
  const papersData = await getPapersData()
  return (
    <div className="min-h-screen flex items-start">
      <div className="w-full px-4 py-12 md:py-16 mx-auto max-w-5xl">
        <AnimatedSection distance={40} duration={0.6} delay={0}>
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Publications
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Browse our published research and conference presentations
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection distance={50} stagger={0.1} delay={0.2} duration={0.7}>
          <div className="grid gap-6">
            {papersData.map((paper) => (
              <Card
                key={paper.id}
                className={`hover:shadow-xl transition-all duration-300 ${paper.featured ? 'border border-primary ring-2 ring-primary/20' : ''}`}
              >
                <CardHeader className="space-y-4">
                  {paper.featured && (
                    <Badge className="w-fit bg-gradient-to-r from-primary to-primary/80">
                      Featured Paper
                    </Badge>
                  )}
                  <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                    {paper.slug ? (
                      <Link
                        href={`/papers/${paper.slug}`}
                        className="text-xl md:text-2xl font-bold flex-1 hover:text-primary transition-colors"
                      >
                        {paper.title}
                      </Link>
                    ) : (
                      <CardTitle className="text-xl md:text-2xl flex-1">
                        {paper.title}
                      </CardTitle>
                    )}
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary"
                    >
                      {paper.year}
                    </Badge>
                  </div>
                  <CardDescription className="leading-relaxed text-base">
                    {paper.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {paper.content}
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Users className="w-4 h-4 text-primary" />
                        Authors
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        {paper.authors.join(', ')}
                      </p>
                    </div>

                    {paper.journal && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Quote className="w-4 h-4 text-primary" />
                          Published in
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                          {paper.journal}
                        </p>
                      </div>
                    )}
                  </div>

                  {paper.doi && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-primary" />
                      <a
                        href={`https://doi.org/${paper.doi}`}
                        className="text-sm text-primary hover:underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        DOI: {paper.doi}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{paper.year}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {paper.demoUrl && (
                        <Link
                          href={paper.demoUrl}
                          className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                        >
                          <Play className="w-4 h-4" />
                          Demo
                        </Link>
                      )}
                      {paper.pdfUrl && (
                        <a
                          href={paper.pdfUrl}
                          className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="w-4 h-4" />
                          PDF
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}

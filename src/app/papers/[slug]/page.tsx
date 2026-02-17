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
import { Button } from '@/components/ui/button'
import { Users, Calendar, ExternalLink, Quote, ArrowLeft, Play, FileText, Sparkles } from 'lucide-react'
import { getMarkdownFile, extractToc } from '@/lib/markdown'
import { TableOfContents } from '@/components/table-of-contents'
import { MarkdownBody } from '@/components/markdown-body'
import { getPapersData } from '@/lib/actions/papers'

export async function generateStaticParams() {
  const papersData = await getPapersData()
  return papersData.map((paper) => ({
    slug: paper.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const papersData = await getPapersData()
  const paper = papersData.find(p => p.slug === slug)
  if (!paper) return {}

  return {
    title: paper.title,
    description: paper.description,
  }
}

export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const papersData = await getPapersData()
  const paper = papersData.find(p => p.slug === slug)
  const file = await getMarkdownFile('content/papers', slug)

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
              href="/papers"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Papers
            </Link>

            <article className="max-w-none">
              <div className="mb-8">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                  {file.data.title || paper?.title}
                </h1>

                {file.data.description && (
                  <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                    {file.data.description}
                  </p>
                )}

                {file.data.authors && (
                  <div className="mb-4 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="w-4 h-4 text-primary" />
                      Authors
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {file.data.authors.join(', ')}
                    </p>
                  </div>
                )}

                {file.data.journal && (
                  <div className="mb-4 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Quote className="w-4 h-4 text-primary" />
                      Published in
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {file.data.journal}
                    </p>
                  </div>
                )}

                {file.data.doi && (
                  <div className="mb-4 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    <a
                      href={`https://doi.org/${file.data.doi}`}
                      className="text-sm text-primary hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      DOI: {file.data.doi}
                    </a>
                  </div>
                )}

                {file.data.paperUrl && (
                  <div className="mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <a
                      href={file.data.paperUrl}
                      className="text-sm text-primary hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read Full Paper
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-4 flex-wrap mb-6">
                  {file.data.demoUrl && (
                    <Link
                      href={file.data.demoUrl}
                      className="inline-flex items-center gap-2"
                    >
                      <Button>
                        <Play className="w-4 h-4 mr-2" />
                        Try Demo
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-6 flex-wrap text-sm text-muted-foreground mb-6">
                  {file.data.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={file.data.date}>
                        {new Date(file.data.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                  )}
                  {file.data.year && (
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary"
                    >
                      {file.data.year}
                    </Badge>
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

              {paper?.supersededBy && (
                <div className="mb-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-sm text-amber-900 dark:text-amber-100">
                      <MarkdownBody content={paper.supersededBy.note} />
                      <Link
                        href={`/papers/${paper.supersededBy.slug}`}
                        className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:underline"
                      >
                        View {paper.supersededBy.title}
                        <ArrowLeft className="w-3 h-3 rotate-180" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <Card className="border-2">
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

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'
import { getMarkdownFile, extractToc } from '@/lib/markdown'
import { TableOfContents } from '@/components/table-of-contents'
import { MarkdownBody } from '@/components/markdown-body'
import { DemoContent } from './DemoContent'
import { getDemos } from '@/lib/data/demo'

export async function generateStaticParams() {
  const demoData = await getDemos()
  return demoData.map((demo) => ({
    slug: demo.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const demoData = await getDemos()
  const demo = demoData.find(d => d.slug === slug)
  if (!demo) return {}

  return {
    title: demo.title,
    description: demo.description,
  }
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const demoData = await getDemos()
  const demo = demoData.find(d => d.slug === slug)
  const file = await getMarkdownFile('content/demo', slug)

  if (!file) {
    notFound()
  }

  const toc = extractToc(file.content)

  return (
    <div className="min-h-screen flex items-start">
      <div className="w-full px-4 py-12 md:py-16 mx-auto max-w-7xl">
        <div className="flex flex-col gap-8">
          <div className="w-full">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Demos
            </Link>

            <article className="max-w-none">
              <div className="mb-8">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                  Demo: {file.data.title || demo?.title}
                </h1>
              </div>

              <DemoContent slug={demo?.slug || ''} />
            </article>
          </div>

          <div className="flex gap-8">
            <div className="flex-1 min-w-0">
              <Card className="border-2">
                <CardContent className="p-0">
                  <MarkdownBody content={file.content} className="p-8" />
                </CardContent>
              </Card>
            </div>
            <TableOfContents toc={toc} />
          </div>
        </div>
      </div>
    </div>
  )
}

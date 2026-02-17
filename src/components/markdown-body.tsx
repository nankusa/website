'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeKatex from 'rehype-katex'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { Pre } from '@/components/pre'
import { getHighlighter } from 'shikiji'
import { useEffect, useState } from 'react'
import 'katex/dist/katex.min.css'

interface MarkdownBodyProps {
  content: string
  className?: string
}

export function MarkdownBody({ content, className = '' }: MarkdownBodyProps) {
  const [highlighter, setHighlighter] = useState<any>(null)

  useEffect(() => {
    const initHighlighter = async () => {
      const hl = await getHighlighter({
        themes: ['nord'],
        langs: ['python', 'javascript', 'typescript', 'html', 'css', 'json', 'bash', 'sql', 'java', 'cpp', 'go', 'rust', 'php', 'ruby', 'csharp', 'swift', 'kotlin', 'dart', 'scala', 'r', 'matlab', 'latex'],
      })
      setHighlighter(hl)
    }
    initHighlighter()
  }, [])

  return (
    <div className={`markdown-body ${className} relative`}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
          [
            remarkToc,
            {
              heading: '目录',
              maxDepth: 3,
              tight: true,
            },
          ],
        ]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          rehypeKatex,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'append',
              properties: {
                className: ['anchor'],
              },
            },
          ],
        ]}
        components={{
          pre: ({ children, ...props }) => <Pre children={children} {...props} />,
          code: ({ node, className, children, ...props }) => {
            const match = className?.match(/language-(\w+)/)
            
            if (!match) {
              return <code className={className} {...props}>{children}</code>
            }
            
            if (!highlighter) {
              return <code className={className} {...props}>{children}</code>
            }
            
            const lang = match[1]
            const code = String(children).replace(/\n$/, '')
            const html = highlighter.codeToHtml(code, { lang, theme: 'nord' })
            return <div dangerouslySetInnerHTML={{ __html: html }} />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

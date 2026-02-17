import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { slug } from 'github-slugger'

export interface MarkdownMeta {
  title?: string
  description?: string
  date?: string
  tags?: string[]
  author?: string
  readTime?: string
  [key: string]: any
}

export interface MarkdownFile {
  content: string
  data: MarkdownMeta
}

export interface TocItem {
  id: string
  text: string
  level: number
}

export function getMarkdownFiles(dir: string): MarkdownFile[] {
  const fullPath = path.join(process.cwd(), dir)
  const files = fs.readdirSync(fullPath)

  const markdownFiles = files
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => {
      const filePath = path.join(fullPath, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      return {
        content,
        data: {
          ...data,
          slug: file.replace(/\.(md|mdx)$/, ''),
        },
      }
    })

  return markdownFiles
}

export function getMarkdownFile(
  dir: string,
  slug: string
): MarkdownFile | null {
  try {
    const fullPath = path.join(process.cwd(), dir, `${slug}.md`)
    const fileContent = fs.readFileSync(fullPath, 'utf-8')
    const { data, content } = matter(fileContent)

    return {
      content,
      data: {
        ...data,
        slug,
      },
    }
  } catch {
    try {
      const fullPath = path.join(process.cwd(), dir, `${slug}.mdx`)
      const fileContent = fs.readFileSync(fullPath, 'utf-8')
      const { data, content } = matter(fileContent)

      return {
        content,
        data: {
          ...data,
          slug,
        },
      }
    } catch {
      return null
    }
  }
}

export function getAllSlugs(dir: string): string[] {
  const fullPath = path.join(process.cwd(), dir)
  const files = fs.readdirSync(fullPath)

  return files
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => file.replace(/\.(md|mdx)$/, ''))
}

export function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  const toc: TocItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = slug(text)

    toc.push({ id, text, level })
  }

  return toc
}

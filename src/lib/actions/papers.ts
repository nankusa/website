import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Paper } from '@/lib/types/content'

export async function getPapersData(): Promise<Paper[]> {
  const papersDir = path.join(process.cwd(), 'content/papers')
  const files = fs.readdirSync(papersDir)

  const papers = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(papersDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(fileContent)
      const slug = file.replace(/\.md$/, '')

      return {
        id: `paper-${slug}`,
        slug,
        title: data.title || '',
        description: data.description || '',
        content: data.description || '',
        date: data.date || '',
        tags: data.tags || [],
        authors: data.authors || [],
        journal: data.journal,
        year: data.year,
        doi: data.doi,
        pdfUrl: data.pdfUrl,
        citationCount: data.citationCount || 0,
        demoUrl: data.demoUrl,
        paperUrl: data.paperUrl,
        supersededBy: data.supersededBy,
        featured: data.featured || false,
      } as Paper
    })
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return (b.year || 0) - (a.year || 0)
    })

  return papers
}

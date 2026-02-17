'use server'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface SearchItem {
  id: string
  title: string
  description: string
  url: string
  type: string
}

function getMarkdownData(dir: string, type: string, urlPrefix: string): SearchItem[] {
  const fullPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullPath)) return []
  
  const files = fs.readdirSync(fullPath)
  
  return files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(fullPath, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(fileContent)
      const slug = file.replace(/\.md$/, '')
      
      return {
        id: `${type}-${slug}`,
        title: data.title || '',
        description: data.description || '',
        url: `${urlPrefix}/${slug}`,
        type,
      }
    })
}

export async function getSearchData(): Promise<SearchItem[]> {
  const papers = getMarkdownData('content/papers', 'Paper', '/papers')
  const blogs = getMarkdownData('content/blog', 'Blog', '/blog')
  const demos = getMarkdownData('content/demo', 'Demo', '/demo')
  const news = getMarkdownData('content/news', 'News', '/news')
  
  return [...papers, ...blogs, ...demos, ...news]
}

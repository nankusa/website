import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { BlogPost, Demo, NewsItem } from '@/lib/types/content'

/**
 * 从 content 目录下的 markdown 文件自动提取元数据
 * 避免在 lib/data/*.ts 中重复定义数据
 */

export async function getBlogData(): Promise<BlogPost[]> {
  const blogDir = path.join(process.cwd(), 'content/blog')
  const files = fs.readdirSync(blogDir)

  const blogs = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(blogDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)
      const slug = file.replace(/\.md$/, '')

      return {
        id: `blog-${slug}`,
        slug,
        title: data.title || '',
        description: data.description || '',
        content: content.trim() || data.description || '',
        date: data.date || '',
        tags: data.tags || [],
        author: data.author || '',
        readTime: data.readTime ? parseInt(data.readTime) : undefined,
        featured: data.featured || false,
      } as BlogPost
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return blogs
}

export async function getDemoData(): Promise<Demo[]> {
  const demoDir = path.join(process.cwd(), 'content/demo')
  const files = fs.readdirSync(demoDir)

  const demos = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(demoDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)
      const slug = file.replace(/\.md$/, '')

      return {
        id: slug,
        slug,
        title: data.title || '',
        description: data.description || '',
        content: content.trim() || data.description || '',
        date: data.date || '',
        tags: data.tags || [],
      } as Demo
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return demos
}

export async function getNewsData(): Promise<NewsItem[]> {
  const newsDir = path.join(process.cwd(), 'content/news')
  
  // 如果 news 目录不存在，返回空数组
  if (!fs.existsSync(newsDir)) {
    return []
  }
  
  const files = fs.readdirSync(newsDir)

  const news = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(newsDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)
      const slug = file.replace(/\.md$/, '')

      return {
        id: `news-${slug}`,
        title: data.title || '',
        description: data.description || '',
        content: content.trim() || data.description || '',
        date: data.date || '',
        tags: data.tags || [],
        isNews: true,
        category: data.category || 'News',
        linkUrl: data.linkUrl,
        linkType: data.linkType,
        featured: data.featured || false,
      } as NewsItem
    })
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  return news
}

export interface ContentItem {
  id: string
  title: string
  description?: string
  content: string
  date: string
  tags: string[]
  isNews?: boolean
}

export interface NewsItem extends ContentItem {
  isNews: true
  category?: string
  image?: string
  linkUrl?: string
  linkType?: 'blog' | 'paper'
  featured?: boolean
}

export interface BlogPost extends ContentItem {
  slug?: string
  author?: string
  readTime?: number
  featured?: boolean
}

export interface Paper extends ContentItem {
  slug?: string
  authors: string[]
  journal?: string
  venue?: string
  abstract?: string
  year: number
  doi?: string
  pdfUrl?: string
  citationCount?: number
  demoUrl?: string
  paperUrl?: string
  supersededBy?: {
    slug: string
    title: string
    note: string
  }
  featured?: boolean
}

export interface Demo extends ContentItem {
  slug?: string
}

export interface DemoRequest {
  file: File
}

export interface DemoResponse {
  success: boolean
  data: Record<string, any>
  message?: string
}

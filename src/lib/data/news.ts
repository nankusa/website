import { NewsItem } from '../types/content'
import { getNewsData } from '../actions/content'

// 从 content/news/*.md 自动提取数据
// 如需修改新闻内容，请直接编辑对应的 markdown 文件
export async function getNews(): Promise<NewsItem[]> {
  return getNewsData()
}

// 同步版本（用于需要同步获取数据的场景）
// 注意：这会在构建时执行，确保 markdown 文件已存在
export { getNewsData as getNewsSync } from '../actions/content'

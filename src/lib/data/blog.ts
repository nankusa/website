import { BlogPost } from '../types/content'
import { getBlogData } from '../actions/content'

// 从 content/blog/*.md 自动提取数据
// 如需修改博客内容，请直接编辑对应的 markdown 文件
export async function getBlogs(): Promise<BlogPost[]> {
  return getBlogData()
}

// 同步版本（用于需要同步获取数据的场景）
// 注意：这会在构建时执行，确保 markdown 文件已存在
export { getBlogData as getBlogsSync } from '../actions/content'

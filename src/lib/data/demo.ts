import { Demo } from '../types/content'
import { getDemoData } from '../actions/content'

// 从 content/demo/*.md 自动提取数据
// 如需修改演示内容，请直接编辑对应的 markdown 文件
export async function getDemos(): Promise<Demo[]> {
  return getDemoData()
}

// 同步版本（用于需要同步获取数据的场景）
// 注意：这会在构建时执行，确保 markdown 文件已存在
export { getDemoData as getDemosSync } from '../actions/content'

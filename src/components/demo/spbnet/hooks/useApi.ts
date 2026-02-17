import { useCallback } from 'react'
import { BASE_URL } from '../constants'

export function useApi() {
  const post = useCallback(async (url: string, data: any) => {
    const fullUrl = BASE_URL + url
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      throw new Error('Invalid JSON response')
    }
  }, [])

  const get = useCallback(async (url: string, query: any) => {
    const fullUrl = BASE_URL + url
    const params = new URLSearchParams(query).toString()
    const res = await fetch(`${fullUrl}?${params}`)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      throw new Error('Invalid JSON response')
    }
  }, [])

  return { post, get }
}

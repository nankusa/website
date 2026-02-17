'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState, useMemo, useEffect } from 'react'
import Fuse from 'fuse.js'
import { getSearchData } from '@/lib/actions/search'

interface SearchItem {
  id: string
  title: string
  description: string
  url: string
  type: string
}

// 配置 Fuse.js 选项
const fuseOptions = {
  keys: ['title', 'description'],
  threshold: 0.4,
  includeScore: true,
}

export function SearchComponent() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchData, setSearchData] = useState<SearchItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open) {
      setIsLoading(true)
      getSearchData().then(data => {
        setSearchData(data)
        setIsLoading(false)
      })
    }
  }, [open])

  const fuse = useMemo(() => {
    return new Fuse(searchData, fuseOptions)
  }, [searchData])

  const results = useMemo(() => {
    if (!query.trim()) return []
    
    const searchResults = fuse.search(query)
    return searchResults.slice(0, 10).map(result => result.item)
  }, [query, fuse])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden p-0 gap-0 top-[20%] translate-y-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-left">Search</DialogTitle>
        </DialogHeader>
        <div className="p-4 overflow-hidden">
          <div className="relative mb-4">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for articles, papers, etc."
              className="pl-10"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <p className="text-muted-foreground text-center py-8">
                Loading...
              </p>
            )}
            
            {!isLoading && query.trim() && results.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No results found for &quot;{query}&quot;
              </p>
            )}
            
            {!isLoading && results.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={() => setOpen(false)}
                className="block p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {item.type}
                  </span>
                </div>
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

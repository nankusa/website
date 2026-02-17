'use client'

import { useEffect, useState, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { TocItem } from '@/lib/markdown'

export type { TocItem }

interface TableOfContentsProps {
  toc: TocItem[]
  activeId?: string
}

export function TableOfContents({ toc, activeId }: TableOfContentsProps) {
  const [currentId, setCurrentId] = useState<string>(activeId || '')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    if (activeId) {
      setCurrentId(activeId)
    }
  }, [activeId])

  useEffect(() => {
      const handleScroll = () => {
        const scrollPosition = window.scrollY + 100

        let currentSectionId = ''

        for (const item of toc) {
          const element = document.getElementById(item.id)
          if (element) {
            const elementTop = element.getBoundingClientRect().top + window.pageYOffset
            if (elementTop > scrollPosition) {
              break
            }
            currentSectionId = item.id
          }
        }

      if (currentSectionId && currentSectionId !== currentId) {
        setCurrentId(currentSectionId)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [toc])

  if (toc.length === 0) {
    return null
  }

  return (
    <aside className="hidden lg:block w-64 shrink-0 sticky top-20 self-start">
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="py-4">
          <div className="font-semibold text-sm mb-4 px-4 text-[var(--nord0)] dark:text-[var(--nord6)]">On this page</div>
          <div className="space-y-1">
            {toc.map((item) => {
              const isActive = currentId === item.id
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn(
                    'block px-4 py-2 text-sm rounded-md transition-all duration-200 border-l-2',
                    item.level === 2 && 'font-medium',
                    item.level === 3 && 'pl-8',
                    item.level >= 4 && 'pl-12',
                    isActive
                      ? 'bg-[rgba(143,188,187,0.2)] text-[var(--nord10)] border-[var(--nord8)] dark:bg-[rgba(143,188,187,0.15)] dark:text-[var(--nord8)]'
                      : 'text-[var(--nord3)] border-transparent hover:text-[var(--nord0)] hover:bg-[var(--nord5)] dark:text-[var(--nord4)] dark:hover:text-[var(--nord6)] dark:hover:bg-[var(--nord2)]'
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    const element = sectionRefs.current[item.id] || document.getElementById(item.id)
                    if (element) {
                      if (!sectionRefs.current[item.id]) {
                        sectionRefs.current[item.id] = element
                      }
                      const navHeight = 76
                      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                      const offsetPosition = elementPosition - navHeight

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth',
                      })
                      setCurrentId(item.id)
                    }
                  }}
                >
                  {item.text}
                </a>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}

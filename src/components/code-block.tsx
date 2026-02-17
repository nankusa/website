'use client'

import { useState, cloneElement } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const preElement = children as any
    if (preElement?.props?.children) {
      const codeContent = preElement.props.children
      const codeText =
        typeof codeContent === 'string'
          ? codeContent
          : Array.isArray(codeContent)
            ? codeContent.join('')
            : ''

      if (codeText) {
        try {
          await navigator.clipboard.writeText(codeText)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (err) {
          console.error('Failed to copy code:', err)
        }
      }
    }
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className={cn(
          'absolute right-2 top-2 p-2 rounded-md transition-all duration-200 z-10',
          'opacity-0 group-hover:opacity-100',
          'bg-muted hover:bg-muted/80',
          'focus:opacity-100'
        )}
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {children}
    </div>
  )
}

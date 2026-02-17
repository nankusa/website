'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Newspaper,
  BookOpen,
  FileText,
  Play,
  X,
  Menu,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { SearchComponent } from '@/components/search'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/papers', label: 'Papers', icon: FileText },
  { href: '/demo', label: 'Demo', icon: Play },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav
        className={cn(
          'sticky top-0 z-50 border-b backdrop-blur-md transition-colors',
          mobileMenuOpen ? 'bg-background' : 'bg-background/80'
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg overflow-hidden">
              <Image
                src="/avatar.jpg"
                alt="Avatar"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold hidden sm:inline-block">
              JWZou's Lab
            </span>
          </Link>

          <div className="flex gap-1 md:gap-2 items-center">
            <SearchComponent />
            <ThemeSwitcher />
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  mobileMenuOpen ? 'bg-accent' : 'hover:bg-accent'
                )}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.replace(/\/$/, '') === item.href.replace(/\/$/, '')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-white dark:bg-card border-b border-t border-border shadow-lg z-50 md:hidden overflow-y-auto max-h-[calc(100vh-4rem)]">
            <div className="container px-4 py-4">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname.replace(/\/$/, '') === item.href.replace(/\/$/, '')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/avatar.jpg"
                      alt="Avatar"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">七草NaNKusa</p>
                    <p className="text-sm text-muted-foreground">
                      JWZou's Lab
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

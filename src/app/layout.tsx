import type { ReactNode } from 'react'
import { Navbar } from '@/components/navbar'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import 'github-markdown-css/github-markdown-light.css'

export const metadata = {
  title: 'JWZou\'s Lab',
  description: 'A website showcasing news, blog posts, publications, and demos from Jiawen Zou.',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

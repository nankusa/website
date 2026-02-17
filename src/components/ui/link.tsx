import NextLink from 'next/link'
import { cn } from '@/lib/utils'

export function Link({
  href,
  children,
  className,
  ...props
}: React.ComponentProps<typeof NextLink>) {
  return (
    <NextLink href={href} className={cn(className)} {...props}>
      {children}
    </NextLink>
  )
}

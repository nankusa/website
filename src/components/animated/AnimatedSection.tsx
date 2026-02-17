'use client'

import { ReactNode } from 'react'
import AnimatedContent from './AnimatedContent'
import { Typewriter } from '../typewriter'

interface AnimatedSectionProps {
  children: ReactNode
  distance?: number
  stagger?: number
  delay?: number
  duration?: number
  className?: string
}

export function AnimatedSection({
  children,
  distance = 50,
  stagger = 0.1,
  delay = 0.2,
  duration = 0.7,
  className = '',
}: AnimatedSectionProps) {
  return (
    <AnimatedContent
      distance={distance}
      stagger={stagger}
      delay={delay}
      duration={duration}
    >
      <div className={className}>{children}</div>
    </AnimatedContent>
  )
}

interface TypewriterHeadingProps {
  text: string
  speed?: number
  delay?: number
  className?: string
}

export function TypewriterHeading({
  text,
  speed = 80,
  delay = 300,
  className = '',
}: TypewriterHeadingProps) {
  return (
    <h1 className={className}>
      <Typewriter text={text} speed={speed} delay={delay} />
    </h1>
  )
}

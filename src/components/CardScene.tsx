import type { ReactNode } from 'react'

type CardSceneProps = {
  children: ReactNode
}

export function CardScene({ children }: CardSceneProps) {
  return (
    <div
      className="relative z-0 flex min-h-0 w-full flex-1 items-center justify-center overflow-visible px-3 py-7 sm:px-4 sm:py-9 md:py-10"
      style={{ perspective: '1200px' }}
    >
      {children}
    </div>
  )
}

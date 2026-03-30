import type { ReactNode } from 'react'

type CardSceneProps = {
  children: ReactNode
}

export function CardScene({ children }: CardSceneProps) {
  return (
    <div
      className="flex flex-1 items-center justify-center px-4 py-8"
      style={{ perspective: '1200px' }}
    >
      {children}
    </div>
  )
}

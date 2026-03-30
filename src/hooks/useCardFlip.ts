import { useCallback, useRef, useState } from 'react'
import { PIXELS_FOR_FULL_PEEL } from '../constants'
import type { AppPhase, PeelEdge } from '../types'

export type CardFlipState = {
  phase: AppPhase
  /** めくり進行度（0 = 裏面で完全に覆われている、1 = 表面が完全に見える） */
  peelProgress: number
  /** めくりの起点辺 */
  peelEdge: PeelEdge
  /** CSS transition を有効にするか */
  transition: boolean
}

const initialFlipState: CardFlipState = {
  phase: 'drawing',
  peelProgress: 1,
  peelEdge: 'bottom',
  transition: false,
}

function determinePeelEdge(
  localX: number,
  localY: number,
  w: number,
  h: number,
): PeelEdge {
  const dists: Record<PeelEdge, number> = {
    top: localY,
    bottom: h - localY,
    left: localX,
    right: w - localX,
  }
  let min = Infinity
  let edge: PeelEdge = 'bottom'
  for (const [key, val] of Object.entries(dists)) {
    if (val < min) {
      min = val
      edge = key as PeelEdge
    }
  }
  return edge
}

export function useCardFlip() {
  const [flip, setFlip] = useState<CardFlipState>(initialFlipState)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  const goFaceDown = useCallback(() => {
    setFlip({
      phase: 'faceDown',
      peelProgress: 0,
      peelEdge: 'bottom',
      transition: true,
    })
  }, [])

  const goRevealFully = useCallback(() => {
    dragStartRef.current = null
    setFlip((s) => {
      if (s.phase !== 'faceDown') return s
      return {
        phase: 'revealed',
        peelProgress: 1,
        peelEdge: s.peelEdge,
        transition: true,
      }
    })
  }, [])

  const resetAll = useCallback(() => {
    dragStartRef.current = null
    setFlip(initialFlipState)
  }, [])

  const handleFlipPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (flip.phase !== 'faceDown') return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)

      const rect = e.currentTarget.getBoundingClientRect()
      dragStartRef.current = { x: e.clientX, y: e.clientY }

      const localX = e.clientX - rect.left
      const localY = e.clientY - rect.top
      const peelEdge = determinePeelEdge(localX, localY, rect.width, rect.height)

      setFlip({
        phase: 'flipping',
        peelProgress: 0,
        peelEdge,
        transition: false,
      })
    },
    [flip.phase],
  )

  const handleFlipPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return
    const start = dragStartRef.current

    setFlip((s) => {
      if (s.phase !== 'flipping') return s

      let dist: number
      switch (s.peelEdge) {
        case 'bottom':
          dist = start.y - e.clientY
          break
        case 'top':
          dist = e.clientY - start.y
          break
        case 'left':
          dist = e.clientX - start.x
          break
        case 'right':
          dist = start.x - e.clientX
          break
      }

      const peelProgress = Math.max(0, Math.min(1, dist / PIXELS_FOR_FULL_PEEL))
      return { ...s, peelProgress }
    })
  }, [])

  const handleFlipPointerUp = useCallback((e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    dragStartRef.current = null

    setFlip((s) => {
      if (s.phase !== 'flipping') return s
      if (s.peelProgress > 0.5) {
        return {
          phase: 'revealed',
          peelProgress: 1,
          peelEdge: s.peelEdge,
          transition: true,
        }
      }
      return {
        phase: 'faceDown',
        peelProgress: 0,
        peelEdge: s.peelEdge,
        transition: true,
      }
    })
  }, [])

  return {
    flip,
    goFaceDown,
    goRevealFully,
    resetAll,
    flipPointerHandlers: {
      onPointerDown: handleFlipPointerDown,
      onPointerMove: handleFlipPointerMove,
      onPointerUp: handleFlipPointerUp,
      onPointerCancel: handleFlipPointerUp,
    },
  }
}

import { forwardRef, useRef } from 'react'
import { CARD_HEIGHT, CARD_RADIUS, CARD_WIDTH } from '../constants'
import type { CardFlipState } from '../hooks/useCardFlip'
import type { PeelEdge } from '../types'
import { usePreventNativeTouchScroll } from '../hooks/usePreventNativeTouchScroll'
import { CardBack } from './CardBack'
import { CardFront } from './CardFront'

type CardProps = {
  flip: CardFlipState
  drawingEnabled: boolean
  drawingPointerHandlers: React.ComponentProps<
    typeof CardFront
  >['pointerHandlers']
  flipPointerHandlers: {
    onPointerDown: React.PointerEventHandler<HTMLDivElement>
    onPointerMove: React.PointerEventHandler<HTMLDivElement>
    onPointerUp: React.PointerEventHandler<HTMLDivElement>
    onPointerCancel: React.PointerEventHandler<HTMLDivElement>
  }
}

function pct(v: number): string {
  return `${Math.round(v * 10000) / 100}%`
}

function computeBackClipPath(edge: PeelEdge, progress: number): string {
  const p = Math.round(progress * 10000) / 100
  switch (edge) {
    case 'bottom':
      return `inset(0 0 ${p}% 0)`
    case 'top':
      return `inset(${p}% 0 0 0)`
    case 'left':
      return `inset(0 0 0 ${p}%)`
    case 'right':
      return `inset(0 ${p}% 0 0)`
    case 'bottom-right': {
      const t = progress * 2
      if (t <= 1) {
        const q = pct(t)
        return `polygon(0% 0%, 100% 0%, 100% calc(100% - ${q}), calc(100% - ${q}) 100%, 0% 100%)`
      }
      const r = pct(t - 1)
      return `polygon(0% 0%, calc(100% - ${r}) 0%, 0% calc(100% - ${r}))`
    }
    case 'top-left': {
      const t = progress * 2
      if (t <= 1) {
        const q = pct(t)
        return `polygon(${q} 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${q})`
      }
      const r = pct(t - 1)
      return `polygon(100% ${r}, 100% 100%, ${r} 100%)`
    }
    case 'top-right': {
      const t = progress * 2
      if (t <= 1) {
        const q = pct(t)
        return `polygon(0% 0%, calc(100% - ${q}) 0%, 100% ${q}, 100% 100%, 0% 100%)`
      }
      const r = pct(t - 1)
      return `polygon(0% ${r}, calc(100% - ${r}) 100%, 0% 100%)`
    }
    case 'bottom-left': {
      const t = progress * 2
      if (t <= 1) {
        const q = pct(t)
        return `polygon(0% 0%, 100% 0%, 100% 100%, ${q} 100%, 0% calc(100% - ${q}))`
      }
      const r = pct(t - 1)
      return `polygon(${r} 0%, 100% 0%, 100% calc(100% - ${r}))`
    }
  }
}

/* ----- fold / curl visual effect ----- */

const CURL_GRADIENT =
  'rgba(0,0,0,0.25), rgba(80,12,28,0.6) 30%, rgba(139,21,56,0.4) 65%, rgba(200,200,200,0.25) 90%, rgba(255,255,255,0.2) 100%'

function EdgePeelEffect({
  edge,
  progress,
}: {
  edge: 'top' | 'bottom' | 'left' | 'right'
  progress: number
}) {
  const curlSize = Math.min(progress * 120, 24)
  const shadowAlpha = (0.12 + progress * 0.18).toFixed(3)
  const pPct = `${progress * 100}%`

  const base: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
  }

  switch (edge) {
    case 'bottom':
      return (
        <>
          <div
            style={{
              ...base,
              left: 0,
              right: 0,
              bottom: pPct,
              height: 20,
              transform: 'translateY(100%)',
              background: `linear-gradient(to bottom, rgba(0,0,0,${shadowAlpha}), transparent)`,
            }}
          />
          <div
            style={{
              ...base,
              left: 0,
              right: 0,
              bottom: pPct,
              height: curlSize,
              background: `linear-gradient(to top, ${CURL_GRADIENT})`,
            }}
          />
          <div
            style={{
              ...base,
              left: 0,
              right: 0,
              bottom: pPct,
              height: 1.5,
              transform: 'translateY(50%)',
              background: 'rgba(255,255,255,0.4)',
            }}
          />
        </>
      )

    case 'top':
      return (
        <>
          <div
            style={{
              ...base,
              left: 0,
              right: 0,
              top: pPct,
              height: 20,
              transform: 'translateY(-100%)',
              background: `linear-gradient(to top, rgba(0,0,0,${shadowAlpha}), transparent)`,
            }}
          />
          <div
            style={{
              ...base,
              left: 0,
              right: 0,
              top: pPct,
              height: curlSize,
              background: `linear-gradient(to bottom, ${CURL_GRADIENT})`,
            }}
          />
          <div
            style={{
              ...base,
              left: 0,
              right: 0,
              top: pPct,
              height: 1.5,
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.4)',
            }}
          />
        </>
      )

    case 'left':
      return (
        <>
          <div
            style={{
              ...base,
              top: 0,
              bottom: 0,
              left: pPct,
              width: 20,
              transform: 'translateX(-100%)',
              background: `linear-gradient(to left, rgba(0,0,0,${shadowAlpha}), transparent)`,
            }}
          />
          <div
            style={{
              ...base,
              top: 0,
              bottom: 0,
              left: pPct,
              width: curlSize,
              background: `linear-gradient(to right, ${CURL_GRADIENT})`,
            }}
          />
          <div
            style={{
              ...base,
              top: 0,
              bottom: 0,
              left: pPct,
              width: 1.5,
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.4)',
            }}
          />
        </>
      )

    case 'right':
      return (
        <>
          <div
            style={{
              ...base,
              top: 0,
              bottom: 0,
              right: pPct,
              width: 20,
              transform: 'translateX(100%)',
              background: `linear-gradient(to right, rgba(0,0,0,${shadowAlpha}), transparent)`,
            }}
          />
          <div
            style={{
              ...base,
              top: 0,
              bottom: 0,
              right: pPct,
              width: curlSize,
              transform: 'translateX(-100%)',
              background: `linear-gradient(to left, ${CURL_GRADIENT})`,
            }}
          />
          <div
            style={{
              ...base,
              top: 0,
              bottom: 0,
              right: pPct,
              width: 1.5,
              transform: 'translateX(50%)',
              background: 'rgba(255,255,255,0.4)',
            }}
          />
        </>
      )
  }
}

function computeFoldLine(
  edge: PeelEdge,
  progress: number,
): { midX: number; midY: number; length: number; angle: number } | null {
  if (
    edge === 'top' ||
    edge === 'bottom' ||
    edge === 'left' ||
    edge === 'right'
  )
    return null
  const W = CARD_WIDTH
  const H = CARD_HEIGHT
  const t = progress * 2

  let ax: number, ay: number, bx: number, by: number

  if (t <= 1) {
    switch (edge) {
      case 'bottom-right':
        ax = W
        ay = (1 - t) * H
        bx = (1 - t) * W
        by = H
        break
      case 'top-left':
        ax = 0
        ay = t * H
        bx = t * W
        by = 0
        break
      case 'top-right':
        ax = (1 - t) * W
        ay = 0
        bx = W
        by = t * H
        break
      case 'bottom-left':
        ax = 0
        ay = (1 - t) * H
        bx = t * W
        by = H
        break
    }
  } else {
    const r = t - 1
    switch (edge) {
      case 'bottom-right':
        ax = (1 - r) * W
        ay = 0
        bx = 0
        by = (1 - r) * H
        break
      case 'top-left':
        ax = W
        ay = r * H
        bx = r * W
        by = H
        break
      case 'top-right':
        ax = 0
        ay = r * H
        bx = (1 - r) * W
        by = H
        break
      case 'bottom-left':
        ax = r * W
        ay = 0
        bx = W
        by = (1 - r) * H
        break
    }
  }

  const midX = (ax + bx) / 2
  const midY = (ay + by) / 2
  const dx = bx - ax
  const dy = by - ay
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI

  return { midX, midY, length, angle }
}

function CornerPeelEffect({
  edge,
  progress,
}: {
  edge: PeelEdge
  progress: number
}) {
  const fold = computeFoldLine(edge, progress)
  if (!fold || fold.length < 1) return null

  const curlSize = Math.min(progress * 120, 24)
  const shadowAlpha = (0.12 + progress * 0.18).toFixed(3)
  const totalHeight = curlSize + 20 + 2

  return (
    <div
      style={{
        position: 'absolute',
        left: fold.midX,
        top: fold.midY,
        width: fold.length,
        height: totalHeight,
        transform: `translate(-50%, -50%) rotate(${fold.angle}deg)`,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: 20,
          top: 0,
          background: `linear-gradient(to top, rgba(0,0,0,${shadowAlpha}), transparent)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: 1.5,
          top: 20,
          background: 'rgba(255,255,255,0.4)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: curlSize,
          top: 21.5,
          background: `linear-gradient(to bottom, ${CURL_GRADIENT})`,
        }}
      />
    </div>
  )
}

function PeelEffect({ edge, progress }: { edge: PeelEdge; progress: number }) {
  if (progress <= 0.005 || progress >= 0.995) return null

  if (
    edge === 'top' ||
    edge === 'bottom' ||
    edge === 'left' ||
    edge === 'right'
  ) {
    return <EdgePeelEffect edge={edge} progress={progress} />
  }
  return <CornerPeelEffect edge={edge} progress={progress} />
}

/* ----- card root ----- */

export const Card = forwardRef<HTMLCanvasElement, CardProps>(function Card(
  { flip, drawingEnabled, drawingPointerHandlers, flipPointerHandlers },
  ref,
) {
  const { phase, peelProgress, peelEdge, transition } = flip
  const flipInteraction = phase === 'faceDown' || phase === 'flipping'
  const flipTouchTargetRef = useRef<HTMLDivElement>(null)
  usePreventNativeTouchScroll(flipTouchTargetRef, flipInteraction)

  const backClipPath = computeBackClipPath(peelEdge, peelProgress)
  const transitionStyle = transition
    ? 'clip-path 0.5s cubic-bezier(0.33, 1, 0.68, 1)'
    : 'none'

  return (
    <div
      className="relative mx-auto"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: CARD_RADIUS,
        overflow: 'hidden',
      }}
    >
      <div
        ref={flipTouchTargetRef}
        role="presentation"
        className="relative h-full w-full"
        style={{
          touchAction: flipInteraction ? 'none' : 'auto',
          userSelect: flipInteraction ? 'none' : 'auto',
          WebkitUserSelect: flipInteraction ? 'none' : 'auto',
          cursor:
            phase === 'flipping'
              ? 'grabbing'
              : flipInteraction
                ? 'grab'
                : 'default',
        }}
        {...(flipInteraction ? flipPointerHandlers : {})}
      >
        {/* Layer 1: front face (always rendered underneath) */}
        <div className="absolute inset-0">
          <CardFront
            ref={ref}
            phase={phase}
            drawingEnabled={drawingEnabled}
            pointerHandlers={drawingPointerHandlers}
          />
        </div>

        {/* Layer 2: back overlay — clip-path reveals front beneath */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: backClipPath,
            transition: transitionStyle,
            pointerEvents: 'none',
          }}
        >
          <CardBack />
        </div>

        {/* Layer 3: fold line shadow + curl visual */}
        {phase === 'flipping' && (
          <PeelEffect edge={peelEdge} progress={peelProgress} />
        )}
      </div>
    </div>
  )
})

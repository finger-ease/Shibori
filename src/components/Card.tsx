import { forwardRef } from 'react'
import { CARD_HEIGHT, CARD_RADIUS, CARD_WIDTH } from '../constants'
import type { CardFlipState } from '../hooks/useCardFlip'
import type { PeelEdge } from '../types'
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
  }
}

/* ----- fold / curl visual effect ----- */

function PeelEffect({ edge, progress }: { edge: PeelEdge; progress: number }) {
  if (progress <= 0.005 || progress >= 0.995) return null

  const curlSize = Math.min(progress * 120, 24)
  const shadowAlpha = (0.12 + progress * 0.18).toFixed(3)
  const pPct = `${progress * 100}%`

  const base: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
  }

  const curlGradientColors =
    'rgba(0,0,0,0.25), rgba(80,12,28,0.6) 30%, rgba(139,21,56,0.4) 65%, rgba(200,200,200,0.25) 90%, rgba(255,255,255,0.2) 100%'

  switch (edge) {
    case 'bottom':
      return (
        <>
          {/* shadow on revealed (below fold) */}
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
          {/* curl strip (above fold, on back side) */}
          <div
            style={{
              ...base,
              left: 0,
              right: 0,
              bottom: pPct,
              height: curlSize,
              background: `linear-gradient(to top, ${curlGradientColors})`,
            }}
          />
          {/* highlight at fold line */}
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
              background: `linear-gradient(to bottom, ${curlGradientColors})`,
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
              background: `linear-gradient(to right, ${curlGradientColors})`,
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
              background: `linear-gradient(to left, ${curlGradientColors})`,
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

/* ----- card root ----- */

export const Card = forwardRef<HTMLCanvasElement, CardProps>(function Card(
  { flip, drawingEnabled, drawingPointerHandlers, flipPointerHandlers },
  ref,
) {
  const { phase, peelProgress, peelEdge, transition } = flip
  const flipInteraction = phase === 'faceDown' || phase === 'flipping'

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

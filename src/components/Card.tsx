import { forwardRef } from 'react'
import { CARD_HEIGHT, CARD_WIDTH } from '../constants'
import type { CardFlipState } from '../hooks/useCardFlip'
import { CardBack } from './CardBack'
import { CardFront } from './CardFront'

type CardProps = {
  flip: CardFlipState
  cardTransform: string
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

export const Card = forwardRef<HTMLCanvasElement, CardProps>(function Card(
  {
    flip,
    cardTransform,
    drawingEnabled,
    drawingPointerHandlers,
    flipPointerHandlers,
  },
  ref,
) {
  const phase = flip.phase
  const flipInteraction = phase === 'faceDown' || phase === 'flipping'

  const transitionStyle = flip.transition
    ? 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)'
    : 'none'

  return (
    <div
      className="relative mx-auto"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      }}
    >
      <div
        role="presentation"
        className="relative h-full w-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: cardTransform,
          transition: transitionStyle,
          touchAction: flipInteraction ? 'none' : 'auto',
          userSelect: flipInteraction ? 'none' : 'auto',
          WebkitUserSelect: flipInteraction ? 'none' : 'auto',
          cursor:
            phase === 'flipping' ? 'grabbing' : flipInteraction ? 'grab' : 'default',
        }}
        {...(flipInteraction ? flipPointerHandlers : {})}
      >
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <CardFront
            ref={ref}
            phase={phase}
            drawingEnabled={drawingEnabled}
            pointerHandlers={drawingPointerHandlers}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <CardBack />
        </div>
      </div>
    </div>
  )
})

import { forwardRef, useCallback, useRef, useState } from 'react'
import { CARD_HEIGHT, CARD_WIDTH, PEEL_VIEW_MARGIN } from '../constants'
import type { CardFlipState } from '../hooks/useCardFlip'
import { usePreventNativeTouchScroll } from '../hooks/usePreventNativeTouchScroll'
import { CardFront } from './CardFront'
import { CardPeelThree } from './CardPeelThree'

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

function assignRef<T>(ref: React.Ref<T> | null, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref && typeof ref === 'object' && 'current' in ref) {
    ;(ref as React.MutableRefObject<T | null>).current = value
  }
}

export const Card = forwardRef<HTMLCanvasElement, CardProps>(function Card(
  { flip, drawingEnabled, drawingPointerHandlers, flipPointerHandlers },
  ref,
) {
  const { phase } = flip
  const flipInteraction = phase === 'faceDown' || phase === 'flipping'
  const flipTouchTargetRef = useRef<HTMLDivElement | null>(null)
  usePreventNativeTouchScroll(flipTouchTargetRef, flipInteraction)

  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null)

  const setCanvasRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      assignRef(ref, el)
      setCanvasEl(el)
    },
    [ref],
  )

  const showDomFront = phase === 'drawing' || phase === 'revealed'
  const peelPad = PEEL_VIEW_MARGIN
  const outerW = flipInteraction ? CARD_WIDTH + 2 * peelPad : CARD_WIDTH
  const outerH = flipInteraction ? CARD_HEIGHT + 2 * peelPad : CARD_HEIGHT

  return (
    <div
      className="relative mx-auto shrink-0"
      style={{
        width: outerW,
        height: outerH,
        borderRadius: 0,
        overflow: flipInteraction ? 'visible' : 'hidden',
      }}
    >
      <div
        className="relative h-full w-full"
        style={{
          touchAction: flipInteraction ? 'none' : 'auto',
          userSelect: flipInteraction ? 'none' : 'auto',
          WebkitUserSelect: flipInteraction ? 'none' : 'auto',
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            visibility: showDomFront ? 'visible' : 'hidden',
            pointerEvents: showDomFront ? 'auto' : 'none',
          }}
          aria-hidden={!showDomFront}
        >
          <CardFront
            ref={setCanvasRef}
            phase={phase}
            drawingEnabled={drawingEnabled}
            pointerHandlers={drawingPointerHandlers}
          />
        </div>

        {flipInteraction && (
          <div className="absolute inset-0 z-10">
            <CardPeelThree
              flip={flip}
              drawingCanvas={canvasEl}
              pointerHandlers={flipPointerHandlers}
              containerRef={flipTouchTargetRef}
            />
          </div>
        )}
      </div>
    </div>
  )
})

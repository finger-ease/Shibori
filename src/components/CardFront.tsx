import { forwardRef } from 'react'
import type { AppPhase } from '../types'
import { CARD_HEIGHT, CARD_WIDTH } from '../constants'
import { DrawingCanvas } from './DrawingCanvas'

type CardFrontProps = {
  phase: AppPhase
  drawingEnabled: boolean
  pointerHandlers: React.ComponentProps<typeof DrawingCanvas>['pointerHandlers']
}

export const CardFront = forwardRef<HTMLCanvasElement, CardFrontProps>(
  function CardFront({ phase, drawingEnabled, pointerHandlers }, ref) {
    const hidePointer =
      phase === 'faceDown' || phase === 'flipping' || phase === 'revealed'

    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-white shadow-inner"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 0,
          boxShadow:
            'inset 0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.08)',
          pointerEvents: hidePointer ? 'none' : 'auto',
        }}
      >
        <DrawingCanvas
          ref={ref}
          enabled={drawingEnabled}
          pointerHandlers={pointerHandlers}
        />
      </div>
    )
  },
)

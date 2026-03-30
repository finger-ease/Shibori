import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { CARD_HEIGHT, CARD_WIDTH } from '../constants'

type DrawingCanvasProps = {
  enabled: boolean
  pointerHandlers: {
    onPointerDown: React.PointerEventHandler<HTMLCanvasElement>
    onPointerMove: React.PointerEventHandler<HTMLCanvasElement>
    onPointerUp: React.PointerEventHandler<HTMLCanvasElement>
    onPointerCancel: React.PointerEventHandler<HTMLCanvasElement>
    onPointerLeave: React.PointerEventHandler<HTMLCanvasElement>
  }
}

function assignRef<T>(ref: React.Ref<T> | null, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref && typeof ref === 'object' && 'current' in ref) {
    ;(ref as React.MutableRefObject<T | null>).current = value
  }
}

export const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  function DrawingCanvas({ enabled, pointerHandlers }, ref) {
    const innerRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
      const canvas = innerRef.current
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
      canvas.width = Math.round(CARD_WIDTH * dpr)
      canvas.height = Math.round(CARD_HEIGHT * dpr)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
    }, [])

    const setRefs = useCallback(
      (el: HTMLCanvasElement | null) => {
        innerRef.current = el
        assignRef(ref, el)
      },
      [ref],
    )

    return (
      <canvas
        ref={setRefs}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        className="block h-full w-full touch-none"
        style={{
          touchAction: 'none',
          cursor: enabled ? 'crosshair' : 'default',
          opacity: 1,
        }}
        aria-label="手書きキャンバス"
        {...pointerHandlers}
      />
    )
  },
)

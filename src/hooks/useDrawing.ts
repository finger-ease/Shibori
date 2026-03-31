import { useCallback, useRef } from 'react'
import { CARD_HEIGHT, CARD_RADIUS, CARD_WIDTH } from '../constants'

export type UseDrawingOptions = {
  enabled: boolean
  lineWidth?: number
  strokeStyle?: string
}

function clipRoundRect(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, r)
  ctx.clip()
}

export function useDrawing(options: UseDrawingOptions) {
  const { enabled, lineWidth = 2.5, strokeStyle = '#0a0a0a' } = options
  const isDrawingRef = useRef(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  const setupContext = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = strokeStyle
      ctx.lineWidth = lineWidth
    },
    [lineWidth, strokeStyle],
  )

  const clearCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }, [])

  /** ポインタをキャンバスの「ユーザー座標」に変換（DrawingCanvas の setTransform(dpr) と同じ論理空間） */
  const getLocalPoint = (
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number,
  ) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = CARD_WIDTH / rect.width
    const scaleY = CARD_HEIGHT / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!enabled) return
      const canvas = e.currentTarget
      canvas.setPointerCapture(e.pointerId)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const { x, y } = getLocalPoint(canvas, e.clientX, e.clientY)
      isDrawingRef.current = true
      lastPosRef.current = { x, y }
      ctx.save()
      clipRoundRect(ctx, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS)
      setupContext(ctx)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 0.01, y)
      ctx.stroke()
      ctx.restore()
    },
    [enabled, setupContext],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!enabled || !isDrawingRef.current) return
      const canvas = e.currentTarget
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const { x, y } = getLocalPoint(canvas, e.clientX, e.clientY)
      const last = lastPosRef.current
      if (!last) return
      ctx.save()
      clipRoundRect(ctx, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS)
      setupContext(ctx)
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.restore()
      lastPosRef.current = { x, y }
    },
    [enabled, setupContext],
  )

  const endStroke = useCallback(() => {
    isDrawingRef.current = false
    lastPosRef.current = null
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      endStroke()
    },
    [endStroke],
  )

  const handlePointerLeave = useCallback(() => {
    endStroke()
  }, [endStroke])

  return {
    clearCanvas,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onPointerLeave: handlePointerLeave,
    },
  }
}

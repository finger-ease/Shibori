import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  parseShareStateFromHash,
  type Stroke,
  replaceUrlShareHash,
  renderStrokesToCanvas,
} from '../drawingState'
import {
  type SharePageResult,
  shareOrCopyPageUrl,
} from '../shareUrl'
import { CARD_HEIGHT, CARD_RADIUS, CARD_WIDTH } from '../constants'

export type UseDrawingOptions = {
  enabled: boolean
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  /** 共有 URL に fd（伏せ）を付与する。めくり後も true にして相手は伏せから開く */
  shareFaceDown: boolean
  /** false の間はストローク変更で URL を更新しない（伏せるまで） */
  shareUrlSync: boolean
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

function finalizeStroke(flat: number[]): Stroke | null {
  if (flat.length < 2) return null
  if (flat.length === 2) {
    return [flat[0], flat[1], flat[0] + 0.01, flat[1]]
  }
  return flat
}

function cloneStrokes(strokes: Stroke[]): Stroke[] {
  return strokes.map((s) => s.slice())
}

type DrawingHistory = {
  past: Stroke[][]
  present: Stroke[]
  future: Stroke[][]
}

export function useDrawing(options: UseDrawingOptions) {
  const {
    enabled,
    canvasRef,
    shareFaceDown,
    shareUrlSync,
    lineWidth = 2.5,
    strokeStyle = '#0a0a0a',
  } = options

  const [history, setHistory] = useState<DrawingHistory>(() => {
    const initial =
      typeof window === 'undefined'
        ? []
        : (parseShareStateFromHash(window.location.hash)?.strokes ?? [])
    return { past: [], present: cloneStrokes(initial), future: [] }
  })
  const strokes = history.present

  const isDrawingRef = useRef(false)
  const currentStrokeRef = useRef<number[]>([])

  const setupContext = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = strokeStyle
      ctx.lineWidth = lineWidth
    },
    [lineWidth, strokeStyle],
  )

  const style = useMemo(
    () => ({ lineWidth, strokeStyle }),
    [lineWidth, strokeStyle],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const draw = () => renderStrokesToCanvas(canvas, strokes, style)
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [canvasRef, strokes, style])

  useEffect(() => {
    if (!shareUrlSync) return
    replaceUrlShareHash(strokes, shareFaceDown)
  }, [strokes, shareFaceDown, shareUrlSync])

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
      currentStrokeRef.current = [x, y]
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
      const cur = currentStrokeRef.current
      const lastX = cur[cur.length - 2]
      const lastY = cur[cur.length - 1]
      if (lastX === undefined || lastY === undefined) return
      cur.push(x, y)
      ctx.save()
      clipRoundRect(ctx, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS)
      setupContext(ctx)
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.restore()
    },
    [enabled, setupContext],
  )

  const commitStroke = useCallback(() => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    const raw = currentStrokeRef.current
    currentStrokeRef.current = []
    const stroke = finalizeStroke(raw)
    if (!stroke) return
    setHistory((h) => ({
      past: [...h.past, cloneStrokes(h.present)],
      present: [...h.present, stroke],
      future: [],
    }))
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      commitStroke()
    },
    [commitStroke],
  )

  const handlePointerLeave = useCallback(() => {
    commitStroke()
  }, [commitStroke])

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h
      const prev = h.past[h.past.length - 1]
      return {
        past: h.past.slice(0, -1),
        present: cloneStrokes(prev),
        future: [cloneStrokes(h.present), ...h.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h
      const next = h.future[0]
      return {
        past: [...h.past, cloneStrokes(h.present)],
        present: cloneStrokes(next),
        future: h.future.slice(1),
      }
    })
  }, [])

  const clearCanvas = useCallback(() => {
    setHistory((h) => {
      if (h.present.length === 0 && h.future.length === 0) {
        return h
      }
      return {
        past: [...h.past, cloneStrokes(h.present)],
        present: [],
        future: [],
      }
    })
    replaceUrlShareHash([], false)
  }, [])

  /** 伏せ／めくり後の「全体リセット」用。undo 用の past / future も含めて消す */
  const clearDrawingHistory = useCallback(() => {
    setHistory({ past: [], present: [], future: [] })
    replaceUrlShareHash([], false)
  }, [])

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  const canUndoRef = useRef(canUndo)
  const canRedoRef = useRef(canRedo)
  useEffect(() => {
    canUndoRef.current = canUndo
    canRedoRef.current = canRedo
  }, [canUndo, canRedo])

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (e.key === 'z' || e.key === 'Z') {
        if (e.shiftKey) {
          if (!canRedoRef.current) return
          e.preventDefault()
          redo()
        } else {
          if (!canUndoRef.current) return
          e.preventDefault()
          undo()
        }
        return
      }
      if (e.key === 'y' || e.key === 'Y') {
        if (!canRedoRef.current) return
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, undo, redo])

  const sharePageUrl = useCallback((): Promise<SharePageResult> => {
    return shareOrCopyPageUrl()
  }, [])

  return {
    strokes,
    clearCanvas,
    clearDrawingHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    sharePageUrl,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onPointerLeave: handlePointerLeave,
    },
  }
}

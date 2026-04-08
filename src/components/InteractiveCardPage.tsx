import { useCallback, useRef, useState } from 'react'
import { Card } from './Card'
import { CardScene } from './CardScene'
import { Controls } from './Controls'
import { useCardFlip } from '../hooks/useCardFlip'
import { useDrawing } from '../hooks/useDrawing'

export function InteractiveCardPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { flip, goFaceDown, resetAll, flipPointerHandlers } = useCardFlip()

  const drawingEnabled = flip.phase === 'drawing'
  const {
    clearCanvas,
    clearDrawingHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    sharePageUrl,
    shareFragment,
    pointerHandlers: drawingPointerHandlers,
  } = useDrawing({
    enabled: drawingEnabled,
    canvasRef,
    shareFaceDown:
      flip.phase === 'faceDown' ||
      flip.phase === 'flipping' ||
      flip.phase === 'revealed',
    shareUrlSync:
      flip.phase === 'faceDown' ||
      flip.phase === 'flipping' ||
      flip.phase === 'revealed',
  })

  const [shareFeedback, setShareFeedback] = useState<
    'idle' | 'copied' | 'shared'
  >('idle')

  const handleShareLink = useCallback(async () => {
    const result = await sharePageUrl()
    if (result === 'failed') return
    setShareFeedback(result === 'shared' ? 'shared' : 'copied')
    window.setTimeout(() => setShareFeedback('idle'), 2000)
  }, [sharePageUrl])

  const handleFaceDown = useCallback(() => {
    goFaceDown()
  }, [goFaceDown])

  const handleReset = useCallback(() => {
    clearDrawingHistory()
    resetAll()
  }, [clearDrawingHistory, resetAll])

  const handleClearDrawing = useCallback(() => {
    clearCanvas()
  }, [clearCanvas])

  return (
    <div
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden"
      style={{
        backgroundColor: '#1a2f1f',
        backgroundImage: `
          radial-gradient(ellipse 85% 55% at 50% 48%, #1e4d32 0%, #153d28 42%, #0f2a1c 100%),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.02) 2px,
            rgba(255, 255, 255, 0.02) 4px
          )
        `,
        boxShadow: 'inset 0 0 120px rgba(0,0,0,0.35)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-3 z-0 rounded-[32px] border-[10px] border-[#5c3d2e]"
        style={{
          boxShadow:
            'inset 0 2px 4px rgba(255,255,255,0.12), inset 0 -3px 8px rgba(0,0,0,0.4)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-5 z-0 rounded-[28px] border border-[#3d2818]/80"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 40%)',
        }}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="relative z-20 shrink-0 px-6 pt-6 text-center sm:px-10 sm:pt-8 md:px-14">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-emerald-100/95 drop-shadow-md md:text-3xl">
            <a href={`${import.meta.env.BASE_URL}${shareFragment}`}>
              Shibori
            </a>
          </h1>
          <p className="mx-auto max-w-md text-sm text-emerald-200/75">
            トランプに好きな文字や絵を描いて、バカラのようにしぼろう！
          </p>
        </header>

        <CardScene>
          <Card
            ref={canvasRef}
            flip={flip}
            drawingEnabled={drawingEnabled}
            drawingPointerHandlers={drawingPointerHandlers}
            flipPointerHandlers={flipPointerHandlers}
          />
        </CardScene>

        <Controls
          showClearDrawing={flip.phase === 'drawing'}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          showCopyLink={
            flip.phase === 'faceDown' ||
            flip.phase === 'flipping' ||
            flip.phase === 'revealed'
          }
          shareFeedback={shareFeedback}
          showFaceDown={flip.phase === 'drawing' || flip.phase === 'revealed'}
          showReset={flip.phase === 'revealed'}
          onClearDrawing={handleClearDrawing}
          onShareLink={handleShareLink}
          onFaceDown={handleFaceDown}
          onReset={handleReset}
        />
      </div>
    </div>
  )
}

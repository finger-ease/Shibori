import { useCallback, useRef } from 'react'
import { Card } from './components/Card'
import { CardScene } from './components/CardScene'
import { Controls } from './components/Controls'
import { useCardFlip } from './hooks/useCardFlip'
import { useDrawing } from './hooks/useDrawing'

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const {
    flip,
    goFaceDown,
    goRevealFully,
    resetAll,
    flipPointerHandlers,
  } = useCardFlip()

  const drawingEnabled = flip.phase === 'drawing'
  const { clearCanvas, pointerHandlers: drawingPointerHandlers } = useDrawing({
    enabled: drawingEnabled,
  })

  const handleFaceDown = useCallback(() => {
    goFaceDown()
  }, [goFaceDown])

  const handleReset = useCallback(() => {
    clearCanvas(canvasRef.current)
    resetAll()
  }, [clearCanvas, resetAll])

  const handleClearDrawing = useCallback(() => {
    clearCanvas(canvasRef.current)
  }, [clearCanvas])

  return (
    <div
      className="relative flex min-h-full flex-col"
      style={{
        minHeight: '100%',
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
      {/* 木製レール（常にメインコンテンツより背面） */}
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
        <header className="px-4 pt-8 text-center">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-emerald-100/95 drop-shadow-md md:text-3xl">
            Shibori
          </h1>
          <p className="mx-auto max-w-md text-sm text-emerald-200/75">
            好きな文字や絵を描いて、バカラのようにしぼろう！
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
          showFaceDown={flip.phase === 'drawing'}
          showRevealFully={flip.phase === 'faceDown'}
          showReset={flip.phase === 'revealed'}
          onClearDrawing={handleClearDrawing}
          onFaceDown={handleFaceDown}
          onRevealFully={goRevealFully}
          onReset={handleReset}
        />
      </div>
    </div>
  )
}

export default App

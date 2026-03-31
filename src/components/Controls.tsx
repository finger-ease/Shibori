type ControlsProps = {
  onClearDrawing: () => void
  onShareLink: () => void | Promise<void>
  onFaceDown: () => void
  onRevealFully: () => void
  onReset: () => void
  showClearDrawing: boolean
  showCopyLink: boolean
  shareFeedback: 'idle' | 'copied' | 'shared'
  showFaceDown: boolean
  showRevealFully: boolean
  showReset: boolean
}

function ShareGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
    </svg>
  )
}

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function Controls({
  onClearDrawing,
  onShareLink,
  onFaceDown,
  onRevealFully,
  onReset,
  showClearDrawing,
  showCopyLink,
  shareFeedback,
  showFaceDown,
  showRevealFully,
  showReset,
}: ControlsProps) {
  const shareSuccess = shareFeedback !== 'idle'
  const shareAriaLabel =
    shareFeedback === 'copied'
      ? 'リンクをコピーしました'
      : shareFeedback === 'shared'
        ? '共有しました'
        : 'このページのリンクを共有'

  return (
    <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 px-4 pb-10 pt-2">
      {showClearDrawing && (
        <button
          type="button"
          onClick={onClearDrawing}
          className="rounded-lg border-2 border-slate-500/60 bg-slate-900/80 px-6 py-3 font-semibold text-slate-200 shadow-md transition hover:bg-slate-800 active:scale-[0.98]"
        >
          リセット
        </button>
      )}
      {showCopyLink && (
        <button
          type="button"
          onClick={onShareLink}
          aria-label={shareAriaLabel}
          title={shareAriaLabel}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-slate-500/55 bg-slate-800/95 text-slate-200 shadow-md transition hover:bg-slate-700/95 hover:border-slate-400/50 active:scale-[0.96]"
        >
          {shareSuccess ? (
            <CheckGlyph className="h-6 w-6" />
          ) : (
            <ShareGlyph className="h-6 w-6" />
          )}
        </button>
      )}
      {showReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border-2 border-slate-700 bg-slate-800/90 px-8 py-3 font-semibold text-slate-100 shadow-lg transition hover:bg-slate-700 active:scale-[0.98]"
        >
          リセット
        </button>
      )}
      {showFaceDown && (
        <button
          type="button"
          onClick={onFaceDown}
          className="rounded-lg border-2 border-amber-900/40 bg-gradient-to-b from-amber-700 to-amber-900 px-8 py-3 font-semibold text-amber-50 shadow-lg transition hover:brightness-110 active:scale-[0.98]"
        >
          伏せる
        </button>
      )}
      {showRevealFully && (
        <button
          type="button"
          onClick={onRevealFully}
          className="rounded-lg border-2 border-emerald-900/50 bg-gradient-to-b from-emerald-600 to-emerald-900 px-8 py-3 font-semibold text-emerald-50 shadow-lg transition hover:brightness-110 active:scale-[0.98]"
        >
          めくる
        </button>
      )}
    </div>
  )
}

type ControlsProps = {
  onClearDrawing: () => void
  onCopyLink: () => void | Promise<void>
  onFaceDown: () => void
  onRevealFully: () => void
  onReset: () => void
  showClearDrawing: boolean
  showCopyLink: boolean
  linkCopied: boolean
  showFaceDown: boolean
  showRevealFully: boolean
  showReset: boolean
}

export function Controls({
  onClearDrawing,
  onCopyLink,
  onFaceDown,
  onRevealFully,
  onReset,
  showClearDrawing,
  showCopyLink,
  linkCopied,
  showFaceDown,
  showRevealFully,
  showReset,
}: ControlsProps) {
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
          onClick={onCopyLink}
          className="rounded-lg border-2 border-emerald-700/50 bg-emerald-950/80 px-6 py-3 font-semibold text-emerald-100 shadow-md transition hover:bg-emerald-900/80 active:scale-[0.98]"
        >
          {linkCopied ? 'コピーしました' : 'リンクをコピー'}
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
      {showReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border-2 border-slate-700 bg-slate-800/90 px-8 py-3 font-semibold text-slate-100 shadow-lg transition hover:bg-slate-700 active:scale-[0.98]"
        >
          リセット
        </button>
      )}
    </div>
  )
}

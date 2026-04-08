export function SurfaceCard({
  title,
  body,
  index,
}: {
  title: string
  body: string
  index?: number
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      {index !== undefined && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">
          Step {index}
        </p>
      )}
      <h3 className="text-lg font-semibold text-emerald-50">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-emerald-100/78">{body}</p>
    </article>
  )
}

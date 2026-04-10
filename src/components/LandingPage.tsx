import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { useShareHashFromLocation } from '../hooks/useShareHashFromLocation'
import { SurfaceCard } from './SurfaceCard'

const steps = [
  {
    title: '描く',
    body:
      'トランプ表面に好きな文字や絵を自由に描きます。',
  },
  {
    title: '伏せる',
    body:
      '描き終わったら伏せるボタンを押してトランプを伏せます。',
  },
  {
    title: 'しぼる',
    body:
      '伏せたトランプの裏面をドラッグしてしぼります。どの方向からでもしぼれます。',
  },
  {
    title: '共有する',
    body:
      '共有ボタンを押してURLを共有します。共有された相手は自分が描いた内容のトランプをしぼることができます。',
  },
] as const

const woodFrameShadow =
  'inset 0 2px 4px rgba(255,255,255,0.12), inset 0 -3px 8px rgba(0,0,0,0.4)'

export function LandingPage() {
  const shareHash = useShareHashFromLocation()
  const playHref = shareHash ? `?play${shareHash}` : '?play'
  const headerLinks = [
    {
      label: '概要',
      href: '#overview',
    },
    {
      label: '遊び方',
      href: '#how-to',
    },
    {
      label: 'プレイ',
      href: playHref,
    },
  ] as const

  return (
    <div
      className="flex h-[100dvh] w-full flex-col overflow-hidden"
      style={{
        backgroundColor: '#173422',
        backgroundImage: `
          radial-gradient(ellipse 85% 55% at 50% 48%, #1e4d32 0%, #153d28 42%, #0f2a1c 100%),
          linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 32%),
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
      <SiteHeader links={headerLinks} />

      <div className="relative mx-3 mt-2 mb-2 min-h-0 flex-1 overflow-hidden rounded-[32px] sm:mx-4 lg:mx-6">
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[32px] border-[10px] border-[#5c3d2e]"
          style={{ boxShadow: woodFrameShadow }}
        />
        <div
          className="pointer-events-none absolute inset-[10px] z-0 rounded-[22px] border border-[#3d2818]/80"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 40%)',
          }}
        />

        <main className="absolute inset-[10px] z-10 min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-contain rounded-[22px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-2">
            <section id="overview" className="scroll-mt-4">
              <h1 className="text-4xl font-bold tracking-tight text-emerald-50 sm:text-5xl">
                Shibori
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-100/85">
                トランプに好きな文字や絵を描いて、バカラのようにしぼろう！
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={playHref}
                  className="inline-flex items-center justify-center rounded-full border border-amber-800/50 bg-gradient-to-b from-amber-500 to-amber-700 px-5 py-3 text-sm font-semibold text-amber-50 shadow-lg shadow-amber-950/25 transition hover:brightness-110"
                >
                  プレイ
                </a>
              </div>
            </section>

            <section
              id="how-to"
              className="scroll-mt-4 rounded-[32px] border border-white/10 bg-black/14 p-7 backdrop-blur-sm sm:p-9"
            >
              <h2 className="text-2xl font-bold tracking-tight text-emerald-50 sm:text-3xl">
                遊び方
              </h2>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {steps.map((step, index) => (
                  <SurfaceCard
                    key={step.title}
                    title={step.title}
                    body={step.body}
                    index={index + 1}
                  />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  )
}

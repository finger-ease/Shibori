import { CARD_HEIGHT, CARD_WIDTH } from '../constants'

export function CardBack() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[14px] border-[3px] border-white shadow-inner"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: '#8b1538',
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            rgba(255, 255, 255, 0.06) 8px,
            rgba(255, 255, 255, 0.06) 16px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 8px,
            rgba(0, 0, 0, 0.08) 8px,
            rgba(0, 0, 0, 0.08) 16px
          ),
          radial-gradient(
            ellipse at 50% 40%,
            #c41e3a 0%,
            #8b1538 45%,
            #5c0f26 100%
          )
        `,
      }}
    >
      <div
        className="absolute inset-3 rounded-lg border-2 border-white/40"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}

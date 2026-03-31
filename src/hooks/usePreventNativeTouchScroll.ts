import { useLayoutEffect, type RefObject } from 'react'

/**
 * WebView（LINE アプリ内ブラウザ等）で CSS の touch-action だけでは
 * ページスクロールが奪われる場合がある。passive: false で preventDefault を効かせる。
 */
export function usePreventNativeTouchScroll(
  elementRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useLayoutEffect(() => {
    if (!active) return
    const el = elementRef.current
    if (!el) return

    const prevent = (e: TouchEvent) => {
      e.preventDefault()
    }

    el.addEventListener('touchstart', prevent, { passive: false })
    el.addEventListener('touchmove', prevent, { passive: false })

    return () => {
      el.removeEventListener('touchstart', prevent)
      el.removeEventListener('touchmove', prevent)
    }
  }, [active, elementRef])
}

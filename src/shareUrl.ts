/** スマホ想定: タッチ中心デバイスやモバイル UA */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true
  }
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
    return true
  }
  return false
}

export type SharePageResult = 'shared' | 'copied' | 'failed'

/**
 * モバイル: Web Share API（利用可能なら）。PC: クリップボードへ URL コピー。
 * 共有が未対応・失敗時はクリップボードにフォールバック。
 */
export async function shareOrCopyPageUrl(): Promise<SharePageResult> {
  const url = window.location.href
  const title = document.title

  if (isMobileDevice() && typeof navigator.share === 'function') {
    try {
      await navigator.share({ url, title, text: title })
      return 'shared'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'failed'
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}

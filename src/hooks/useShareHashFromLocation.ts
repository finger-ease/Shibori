import { useSyncExternalStore } from 'react'

function readShareHash(): string {
  if (typeof window === 'undefined') return ''
  return window.location.hash.startsWith('#d=') ? window.location.hash : ''
}

/**
 * 共有用ハッシュ（#d=）が URL にあるときだけ返す。
 * ランディングで ?play へ渡すために hashchange も購読する。
 */
export function useShareHashFromLocation(): string {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('hashchange', onStoreChange)
      return () => window.removeEventListener('hashchange', onStoreChange)
    },
    readShareHash,
    () => '',
  )
}

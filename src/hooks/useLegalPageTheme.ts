import { useEffect } from 'react'

export function useLegalPageTheme() {
  useEffect(() => {
    const prevBodyBackground = document.body.style.background
    const prevBodyColor = document.body.style.color
    const prevColorScheme = document.documentElement.style.colorScheme

    document.body.style.background = '#f8fafc'
    document.body.style.color = '#0f172a'
    document.documentElement.style.colorScheme = 'light'

    return () => {
      document.body.style.background = prevBodyBackground
      document.body.style.color = prevBodyColor
      document.documentElement.style.colorScheme = prevColorScheme
    }
  }, [])
}

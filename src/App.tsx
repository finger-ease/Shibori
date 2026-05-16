import { lazy, Suspense } from 'react'
import { LandingPage } from './components/LandingPage'

const InteractiveCardPage = lazy(() =>
  import('./components/InteractiveCardPage').then((m) => ({
    default: m.InteractiveCardPage,
  })),
)
const PrivacyPage = lazy(() =>
  import('./components/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
)
const TermsPage = lazy(() =>
  import('./components/TermsPage').then((m) => ({ default: m.TermsPage })),
)

function App() {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : ''
  const normalizedPath = pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname

  if (normalizedPath.endsWith('/terms')) {
    return (
      <Suspense fallback={null}>
        <TermsPage />
      </Suspense>
    )
  }

  if (normalizedPath.endsWith('/privacy')) {
    return (
      <Suspense fallback={null}>
        <PrivacyPage />
      </Suspense>
    )
  }

  const isPlayEnabled =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('play')

  if (isPlayEnabled) {
    return (
      <Suspense fallback={null}>
        <InteractiveCardPage />
      </Suspense>
    )
  }

  return <LandingPage />
}

export default App

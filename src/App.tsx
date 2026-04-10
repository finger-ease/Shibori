import { InteractiveCardPage } from './components/InteractiveCardPage'
import { LandingPage } from './components/LandingPage'
import { PrivacyPage } from './components/PrivacyPage'
import { TermsPage } from './components/TermsPage'

function App() {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : ''
  const normalizedPath = pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname

  if (normalizedPath.endsWith('/terms')) {
    return <TermsPage />
  }

  if (normalizedPath.endsWith('/privacy')) {
    return <PrivacyPage />
  }

  const isPlayEnabled =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('play')

  return isPlayEnabled ? <InteractiveCardPage /> : <LandingPage />
}

export default App

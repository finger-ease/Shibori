import { InteractiveCardPage } from './components/InteractiveCardPage'
import { LandingPage } from './components/LandingPage'

function App() {
  const isPlayEnabled =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('play')

  return isPlayEnabled ? <InteractiveCardPage /> : <LandingPage />
}

export default App

import { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence } from 'framer-motion'
import './index.css'
import App from './App'
import WelcomeLoader from './components/WelcomeLoader'

function Root() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {loading ? <WelcomeLoader key="loader" /> : <App key="app" />}
    </AnimatePresence>
  )
}

createRoot(document.getElementById('root')!).render(
  <Root />
)

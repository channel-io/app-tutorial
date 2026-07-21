import { useEffect, useState } from 'react'
import { AppProvider, type ThemeName } from '@channel.io/bezier-react'
import { useWamData } from '@channel.io/app-sdk-wam'

import { isMobile } from './utils/userAgent'
import Send from './pages/Send'

function App() {
  const [theme, setTheme] = useState<ThemeName>('light')
  const appearance = useWamData('appearance')

  useEffect(() => {
    setTheme(appearance === 'dark' ? 'dark' : 'light')
  }, [appearance])

  return (
    <AppProvider themeName={theme}>
      <div style={{ padding: isMobile() ? '16px' : '0 24px 24px 24px' }}>
        <Send />
      </div>
    </AppProvider>
  )
}

export default App

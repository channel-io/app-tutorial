import { useEffect, useState } from 'react'
import { AppProvider, type ThemeName } from '@channel.io/bezier-react'

import { isMobile } from './utils/userAgent'
import { getWamData } from './utils/wam'
import Send from './pages/Send'

function App() {
  const [theme, setTheme] = useState<ThemeName>('light')

  useEffect(() => {
    const appearance = getWamData('appearance')
    setTheme(appearance === 'dark' ? 'dark' : 'light')
  }, [])

  return (
    <AppProvider themeName={theme}>
      <div style={{ padding: isMobile() ? '16px' : '0 24px 24px 24px' }}>
        <Send />
      </div>
    </AppProvider>
  )
}

export default App

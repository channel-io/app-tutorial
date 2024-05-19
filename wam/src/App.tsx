import { useEffect, useState } from 'react'
import {
  BezierProvider,
  type Foundation,
  LightFoundation,
  DarkFoundation,
} from '@channel.io/bezier-react'

import { isMobile } from './utils/userAgent'
import { getWamData } from './utils/wam'
import Send from './pages/Send'

function App() {
  const [foundation, setFoundation] = useState<Foundation>(
    () => LightFoundation
  )

  useEffect(() => {
    const appearance = getWamData('appearance')
    if (appearance === 'dark') {
      setFoundation(DarkFoundation)
    } else {
      setFoundation(LightFoundation)
    }
  }, [])

  return (
    <BezierProvider foundation={foundation}>
      <div style={{ padding: isMobile() ? '16px' : '0 24px 24px 24px' }}>
        <Send />
      </div>
    </BezierProvider>
  )
}

export default App

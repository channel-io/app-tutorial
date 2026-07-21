import {
  HeightSynchronizer,
  WamHeader,
  WamThemeProvider,
} from '@channel.io/app-sdk-wam-ui'
import { useWamClose } from '@channel.io/app-sdk-wam'

import { isMobile } from './utils/userAgent'
import Send from './pages/Send'

function App() {
  const { close } = useWamClose()

  return (
    <WamThemeProvider>
      <HeightSynchronizer maxHeight={480}>
        <WamHeader
          title="Tutorial"
          onClose={close}
        />
        <div style={{ padding: isMobile() ? '0 16px 16px' : '0 24px 24px' }}>
          <Send />
        </div>
      </HeightSynchronizer>
    </WamThemeProvider>
  )
}

export default App

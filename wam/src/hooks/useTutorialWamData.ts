import { useMemo } from 'react'
import { useTypedWamData } from '@channel.io/app-sdk-wam'

import { parseTutorialWamData, type TutorialWamData } from '../contracts'

export interface TutorialWamDataResult {
  data: TutorialWamData | null
  error: Error | null
}

export function useTutorialWamData(): TutorialWamDataResult {
  const appId = useTypedWamData('appId')
  const channelId = useTypedWamData('channelId')
  const managerId = useTypedWamData('managerId')
  const chatId = useTypedWamData('chatId')
  const chatType = useTypedWamData('chatType')
  const chatTitle = useTypedWamData('chatTitle')
  const rootMessageId = useTypedWamData('rootMessageId')
  const broadcast = useTypedWamData('broadcast')
  const message = useTypedWamData('message')
  const targetToken = useTypedWamData('targetToken')

  return useMemo(() => {
    try {
      return {
        data: parseTutorialWamData({
          appId,
          channelId,
          managerId,
          chatId,
          chatType,
          chatTitle,
          rootMessageId,
          broadcast,
          message,
          targetToken,
        }),
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    }
  }, [
    appId,
    broadcast,
    channelId,
    chatId,
    chatTitle,
    chatType,
    managerId,
    message,
    rootMessageId,
    targetToken,
  ])
}

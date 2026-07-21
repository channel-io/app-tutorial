import { useEffect, useCallback, useState } from 'react'
import {
  useCallFunction,
  useNativeFunction,
  useTypedWamData,
  useWamClose,
  useWamSize,
} from '@channel.io/app-sdk-wam'
import {
  VStack,
  HStack,
  Button,
  Text,
  Icon,
  ButtonGroup,
} from '@channel.io/bezier-react'
import { SendIcon } from '@channel.io/bezier-icons'
import { InlineBanner } from '@channel.io/app-sdk-wam-ui'

import * as Styled from './Send.styled'

function Send() {
  const { setSize } = useWamSize()
  const { close } = useWamClose()
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setSize({ width: 390, height: 220 })
  }, [setSize])

  const chatTitle = useTypedWamData('chatTitle') ?? ''
  const appId = useTypedWamData('appId') ?? ''
  const channelId = useTypedWamData('channelId') ?? ''
  const managerId = useTypedWamData('managerId') ?? ''
  const message = String(useTypedWamData('message') ?? '')
  const chatId = useTypedWamData('chatId') ?? ''
  const chatType = useTypedWamData('chatType') ?? ''
  const broadcast = useTypedWamData('broadcast') ?? false
  const rootMessageId = useTypedWamData('rootMessageId')
  const targetToken = String(useTypedWamData('targetToken') ?? '')

  const {
    call: sendAsBot,
    loading: botLoading,
    error: botError,
  } = useCallFunction<void>({
    appId,
    name: 'tutorial.sendAsBot',
  })
  const {
    call: sendAsManager,
    loading: managerLoading,
    error: managerError,
  } = useNativeFunction<void>({ name: 'writeGroupMessageAsManager' })

  const isSending = botLoading || managerLoading
  const statusMessage =
    errorMessage ||
    (botError || managerError
      ? 'The message could not be sent. Check the app permissions and try again.'
      : chatType === 'group' && !targetToken
        ? 'The bot target is unavailable. Close and reopen the command.'
        : chatType && chatType !== 'group'
          ? 'This tutorial sends messages only from a group chat.'
          : '')

  const handleSend = useCallback(
    async (sender: 'bot' | 'manager'): Promise<void> => {
      setErrorMessage('')
      if (chatType !== 'group') {
        setErrorMessage('This tutorial sends messages only from a group chat.')
        return
      }

      try {
        switch (sender) {
          case 'bot': {
            await sendAsBot({
              targetToken,
              broadcast,
              rootMessageId,
            })
            break
          }
          case 'manager': {
            await sendAsManager({
              channelId,
              groupId: chatId,
              rootMessageId,
              broadcast,
              dto: {
                plainText: message,
                managerId,
              },
            })
            break
          }
        }
        close()
      } catch {
        setErrorMessage(
          'The message could not be sent. Check the app permissions and try again.'
        )
      }
    },
    [
      broadcast,
      channelId,
      chatId,
      chatType,
      close,
      managerId,
      message,
      rootMessageId,
      sendAsBot,
      sendAsManager,
      targetToken,
    ]
  )

  return (
    <VStack spacing={16}>
      <HStack justify="center">
        <ButtonGroup>
          <Button
            colorVariant="blue"
            styleVariant="primary"
            text="Send as a manager"
            disabled={chatType !== 'group' || isSending}
            onClick={() => void handleSend('manager')}
          />
          <Button
            colorVariant="blue"
            styleVariant="primary"
            text="Send as a bot"
            disabled={chatType !== 'group' || isSending || !targetToken}
            onClick={() => void handleSend('bot')}
          />
        </ButtonGroup>
      </HStack>
      <HStack justify="center">
        <Styled.CenterTextWrapper>
          <Icon
            source={SendIcon}
            color="icon-neutral-heavy"
            size="xs"
          />
          <Text
            as="span"
            color="text-neutral-light"
          >
            {chatTitle}
          </Text>
        </Styled.CenterTextWrapper>
      </HStack>
      {statusMessage && (
        <InlineBanner
          variant={errorMessage || botError || managerError ? 'error' : 'info'}
          content={statusMessage}
        />
      )}
    </VStack>
  )
}

export default Send

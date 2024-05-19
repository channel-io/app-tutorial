import { useEffect, useMemo, useCallback } from 'react'
import {
  AlphaStack,
  Button,
  ButtonColorVariant,
  ButtonStyleVariant,
  Text,
  Icon,
  IconSize,
  ButtonGroup,
} from '@channel.io/bezier-react'
import { SendIcon } from '@channel.io/bezier-icons'

import { callFunction, callNativeFunction, getWamData, setSize } from '../../utils/wam'
import Header from '../../components/Header'
import * as Styled from './Send.styled'

function Send() {
  useEffect(() => {
    setSize(390, 404)
  }, [])

  const chatTitle = useMemo(() => getWamData('chatTitle') ?? '', [])

  const appId = useMemo(() => getWamData('appId') ?? '', [])
  const channelId = useMemo(() => getWamData('channelId') ?? '', [])
  const managerId = useMemo(() => getWamData('managerId') ?? '', [])
  const message = useMemo(() => getWamData('message') ?? '', [])
  const chatId = useMemo(() => getWamData('chatId') ?? '', [])
  const chatType = useMemo(() => getWamData('chatType') ?? '', [])
  const broadcast = useMemo(() => Boolean(getWamData('broadcast') ?? false), [])
  const rootMessageId = useMemo(() => getWamData('rootMessageId'), [])
  const isPrivate = useMemo(() => Boolean(getWamData('isPrivate')), [])

  const handleSend = useCallback(async (sender: string): Promise<void> => {
    if (chatType === "group") {
      switch (sender) {
        case 'bot':
          await callFunction(appId, 'sendAsBot', {
            groupId: chatId,
          })
          break
        case 'manager':
          await callNativeFunction('writeGroupMessageAsManager', {
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
        default:
          // NOTE: should not reach here
          console.error('Invalid message sender')
      }
    }
    // if (chatType === "directChat") {
    // }
    // if (chatType === "userChat") {
    // }
  }, [
    appId,
    broadcast,
    channelId,
    chatId,
    chatType,
    isPrivate,
    managerId,
    message,
    rootMessageId,
  ])

  return (
    <AlphaStack
      direction="vertical"
      spacing={16}
    >
      <Header />
      <AlphaStack direction="horizontal">
        <ButtonGroup>
          <Button
            autoFocus
            colorVariant={ButtonColorVariant.Blue}
            styleVariant={ButtonStyleVariant.Primary}
            text="Send as a manager"
            onClick={async () => {
              await handleSend('manager')
              close()
            }}
          />
          <Button
            autoFocus
            colorVariant={ButtonColorVariant.Blue}
            styleVariant={ButtonStyleVariant.Primary}
            text="Send as a bot"
            onClick={async () => {
              await handleSend('bot')
              close()
            }}
          />
        </ButtonGroup>
      </AlphaStack>
      <AlphaStack direction='horizontal'>
        <Styled.CenterTextWrapper>
          <Icon
            source={SendIcon}
            color="txt-black-dark"
            size={IconSize.XS}
          />
          <Text
            as="span"
            color="txt-black-dark"
          >
            {chatTitle}
          </Text>
        </Styled.CenterTextWrapper>
      </AlphaStack>
    </AlphaStack>
  )
}

export default Send

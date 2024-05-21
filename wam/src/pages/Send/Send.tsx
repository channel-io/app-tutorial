import { useEffect, useMemo, useCallback } from 'react'
import {
  VStack,
  HStack,
  Button,
  Text,
  Icon,
  ButtonGroup,
} from '@channel.io/bezier-react'
import { CancelIcon, SendIcon } from '@channel.io/bezier-icons'

import {
  callFunction,
  callNativeFunction,
  getWamData,
  setSize,
} from '../../utils/wam'
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

  const handleSend = useCallback(
    async (sender: string): Promise<void> => {
      if (chatType === 'group') {
        switch (sender) {
          case 'bot':
            await callFunction(appId, 'sendAsBot', {
              input: {
                groupId: chatId,
                broadcast,
                rootMessageId,
              },
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
      } else if (chatType === 'directChat') {
        // FIXME: Implement
      } else if (chatType === 'userChat') {
        // FIXME: Implement
      }
    },
    [
      appId,
      broadcast,
      channelId,
      chatId,
      chatType,
      managerId,
      message,
      rootMessageId,
    ]
  )

  return (
    <VStack spacing={16}>
      <HStack justify="between">
        <Text
          color="txt-black-darkest"
          typo="24"
          bold
        >
          Tutorial
        </Text>
        <Button
          colorVariant="monochrome-dark"
          styleVariant="tertiary"
          leftContent={CancelIcon}
          onClick={() => close()}
        />
      </HStack>
      <HStack justify="center">
        <ButtonGroup>
          <Button
            colorVariant="blue"
            styleVariant="primary"
            text="Send as a manager"
            onClick={async () => {
              await handleSend('manager')
              close()
            }}
          />
          <Button
            colorVariant="blue"
            styleVariant="primary"
            text="Send as a bot"
            onClick={async () => {
              await handleSend('bot')
              close()
            }}
          />
        </ButtonGroup>
      </HStack>
      <HStack justify="center">
        <Styled.CenterTextWrapper>
          <Icon
            source={SendIcon}
            color="txt-black-dark"
            size="xs"
          />
          <Text
            as="span"
            color="txt-black-dark"
          >
            {chatTitle}
          </Text>
        </Styled.CenterTextWrapper>
      </HStack>
    </VStack>
  )
}

export default Send

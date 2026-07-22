import schema from '../../contracts/tutorial-wam-data.schema.json'

export const TUTORIAL_WAM_NAME = schema['x-channel-wam-name']
export const TUTORIAL_FUNCTIONS = schema['x-channel-functions']

export interface TutorialWamData {
  appId: string
  channelId: string
  managerId: string
  chatId: string
  chatType: string
  chatTitle: string
  rootMessageId?: string
  broadcast: boolean
  message: string
  targetToken?: string
}

export type SendAsBotInput = {
  targetToken: string
  rootMessageId?: string
  broadcast: boolean
}

export type WriteGroupMessageAsManagerInput = {
  channelId: string
  groupId: string
  rootMessageId?: string
  broadcast: boolean
  dto: {
    plainText: string
    managerId: string
  }
}

export function parseTutorialWamData(value: unknown): TutorialWamData {
  if (typeof value !== 'object' || value === null) {
    throw new Error('The host did not provide the expected tutorial WAM data.')
  }

  const data = value as Record<string, unknown>
  for (const field of schema.required) {
    if (data[field] === undefined) {
      throw new Error(
        'The host did not provide the expected tutorial WAM data.'
      )
    }
  }

  for (const [field, definition] of Object.entries(schema.properties)) {
    const fieldValue = data[field]
    if (fieldValue !== undefined && typeof fieldValue !== definition.type) {
      throw new Error(
        'The host did not provide the expected tutorial WAM data.'
      )
    }
  }

  return data as unknown as TutorialWamData
}

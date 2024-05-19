export function getWamData(key: string) {
  if (typeof window.getWamData === 'function') {
    return window.getWamData(key)
  }
  return undefined
}

export function close(
  appId?: string,
  name?: string,
  params?: Record<string, any>
) {
  if (typeof window.close === 'function') {
    if (appId && name) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return window.close({ appId, name, params })
    }
    return window.close()
  }
}

export function setSize(width: number, height: number) {
  if (typeof window.setSize === 'function') {
    return window.setSize({ width, height })
  }
}

export async function callFunction(
  appId: string,
  name: string,
  params: Record<string, any>
) {
  if (typeof window.callFunction === 'function') {
    return window.callFunction({ appId, name, params })
  }
  return Promise.reject()
}

export async function callNativeFunction(
  name: string,
  params: Record<string, any>
) {
  if (typeof window.callNativeFunction === 'function') {
    return window.callNativeFunction({ name, params })
  }
  return Promise.reject()
}

export function callCommand(
  appId: string,
  name: string,
  params: Record<string, any>
) {
  if (typeof window.callCommand === 'function') {
    return window.callCommand({ appId, name, params })
  }
}

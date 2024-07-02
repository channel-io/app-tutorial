/// <reference types="vite/client" />

interface Window {
  ChannelIOWam: {
    getWamData: (key: string) => string | null
    close: ({
      appId,
      name,
      params = null,
    }: {
      appId: string
      name: string
      params: Record<string, any>
    } = {}) => void
    setSize: ({ width, height }: { width: number; height: number }) => void
    callFunction: ({
      appId,
      name,
      params,
    }: {
      appId: string
      name: string
      params: Record<string, any>
    }) => Promise<any>
    callNativeFunction: ({
      name,
      params,
    }: {
      name: string
      params: Record<string, any>
    }) => Promise<any>
    callCommand: ({
      appId,
      name,
      params,
    }: {
      appId: string
      name: string
      params: Record<string, any>
    }) => void
  }
}

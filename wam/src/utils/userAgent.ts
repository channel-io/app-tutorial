function getUserAgent() {
  return window.parent.navigator.userAgent
}

export function isMobile() {
  const ua = getUserAgent()
  return ua.includes('Mobi')
}

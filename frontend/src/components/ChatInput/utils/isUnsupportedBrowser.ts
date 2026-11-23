export const isUnsupportedBrowser = () => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)

  return isSafari || isIOS
}

export const getUserIdFromAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null
  }

  const token = window.localStorage.getItem("access_token")

  if (!token) {
    return null
  }

  try {
    const [, payload] = token.split(".")

    if (!payload) {
      return null
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    )
    const decodedPayload = JSON.parse(window.atob(paddedBase64))
    const userId = decodedPayload.user_id ?? decodedPayload.sub

    return userId === undefined || userId === null ? null : String(userId)
  } catch {
    return null
  }
}
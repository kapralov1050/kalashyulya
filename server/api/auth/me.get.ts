interface MeResponse {
  user: { uid: string, email: string } | null
}

export default defineEventHandler((event): MeResponse => {
  try {
    const cookie = getCookie(event, 'auth_token')
    if (cookie) {
      return {
        user: {
          uid: 'test-uid',
          email: cookie,
        },
      }
    }
    return { user: null }
  } catch {
    return { user: null }
  }
})

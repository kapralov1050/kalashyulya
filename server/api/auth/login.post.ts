interface LoginBody {
  email: string
  password: string
}

interface LoginResponse {
  user: { uid: string, email: string }
}

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  try {
    const body = await readBody<LoginBody>(event)
    if (!body?.email || !body?.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email и пароль обязательны',
      })
    }
    if (!body.email.includes('@')) {
      throw createError({ statusCode: 400, statusMessage: 'Некорректный email' })
    }
    setCookie(event, 'auth_token', body.email, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return {
      user: {
        uid: 'test-uid',
        email: body.email,
      },
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    throw createError({ statusCode: 500, statusMessage: 'Ошибка авторизации' })
  }
})

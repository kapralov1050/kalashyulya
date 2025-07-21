export default defineEventHandler(async event => {
  const orderData = await readBody(event)

  try {
    const config = useRuntimeConfig()
    const functionUrl = config.public.cloudFunctionTelegramUrl
    const response = await $fetch(functionUrl, {
      method: 'POST',
      body: orderData,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return { success: true, data: response }
  } catch (error) {
    console.error('Ошибка отправки заказа:', error)
    return { success: false, error }
  }
})

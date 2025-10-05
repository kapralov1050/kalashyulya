export default defineEventHandler(async event => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })

  // Обработка preflight запроса
  if (event.node.req.method === 'OPTIONS') {
    return { success: true }
  }

  const orderData = await readBody(event)

  try {
    const config = useRuntimeConfig()
    const functionUrl = config.public.cloudFunctionEmailUrl
    const response = await $fetch(functionUrl, {
      method: 'POST',
      body: orderData,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return { success: true, data: response }
  } catch (error) {
    console.log('Ошибка отправки заказа:', error)
    return { success: false, error }
  }
})

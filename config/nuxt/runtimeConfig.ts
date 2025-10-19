import type { NuxtConfig } from 'nuxt/config'

export const runtimeConfig: NuxtConfig['runtimeConfig'] = {
  public: {
    cloudFunctionTelegramUrl:
      process.env.NUXT_PUBLIC_CLOUD_FUNCTION_TELEGRAM_URL,
    cloudFunctionEmailUrl: process.env.NUXT_PUBLIC_CLOUD_FUNCTION_EMAIL_URL,
    cloudFunctionPresignedUrl:
      process.env.NUXT_PUBLIC_CLOUD_FUNCTION_PRESIGNED_URL,
    bucketName: process.env.NUXT_PUBLIC_BUCKET_NAME,
  },
}

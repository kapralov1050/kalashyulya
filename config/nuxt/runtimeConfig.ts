import type { NuxtConfig } from 'nuxt/config'

export const runtimeConfig: NuxtConfig['runtimeConfig'] = {
  yookassaShopId: process.env.NUXT_YOOKASSA_SHOP_ID,
  yookassaSecret: process.env.NUXT_YOOKASSA_SECRET,
  telegramBotToken: process.env.NUXT_TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.NUXT_TELEGRAM_CHAT_ID,
  smtpHost: process.env.NUXT_SMTP_HOST,
  smtpUser: process.env.NUXT_SMTP_USER,
  smtpPass: process.env.NUXT_SMTP_PASS,
  smtpFrom: process.env.NUXT_SMTP_FROM,
  public: {
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://kalashyulya.ru',
    cloudFunctionUploadProduct:
      process.env.NUXT_PUBLIC_CLOUD_FUNCTION_UPLOAD_PRODUCT_URL,
    cloudFunctionDeleteProductImage:
      process.env.NUXT_PUBLIC_CLOUD_FUNCTION_DELETE_PRODUCT_FILE,
    cloudFunctionUploadLocales:
      process.env.NUXT_PUBLIC_CLOUD_FUNCTION_UPLOAD_LOCALES,
    bucketName: process.env.NUXT_PUBLIC_BUCKET_NAME,
    dadataApiKey: process.env.NUXT_PUBLIC_DADATA_API_KEY,
    dadataSecretKey: process.env.NUXT_PUBLIC_DADATA_SECRET_KEY,
    statsUpload: process.env.NUXT_PUBLIC_CLOUD_FUNCTION_UPLOAD_STATS,
    stats: process.env.NUXT_PUBLIC_STATS,
    locales: process.env.NUXT_PUBLIC_LOCALES,
    cloudFunctionPdfGenerator:
      process.env.NUXT_PUBLIC_CLOUD_FUNCTION_PDF_GENERATOR_URL,
    cloudFunctionDeploy: process.env.NUXT_PUBLIC_CLOUD_FUNCTION_DEPLOY,
    cloudFunctionDeploySecret:
      process.env.NUXT_PUBLIC_CLOUD_FUNCTION_DEPLOY_SECRET,
  },
}

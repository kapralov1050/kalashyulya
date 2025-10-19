import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()

export function useYandexDatabase() {
  const presignedUrl = ref<string | null>(null)
  async function createPresignedDownloadLink(key: string) {
    try {
      const response = await $fetch<{ presignedUrl: string }>(
        `${config.public.cloudFunctionPresignedUrl}`,
        {
          method: 'POST',
          body: JSON.stringify({ fileName: key }),
        },
      )

      if (response) {
        presignedUrl.value = response.presignedUrl
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function uploadToBucket(file: File) {
    try {
      await createPresignedDownloadLink(file.name)
      console.log(file.type)

      await $fetch(`${presignedUrl.value}`, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      })

      return `https://storage.yandexcloud.net/${process.env.NUXT_PUBLIC_BUCKET_NAME}/${file.name}`
    } catch (error) {
      console.log(error)
    }
  }

  return {
    presignedUrl,
    createPresignedDownloadLink,
    uploadToBucket,
  }
}

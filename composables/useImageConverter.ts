export interface ImageConvertResponse {
  success: boolean
  imageData: string
  fileName: string
  size: string
  error?: string
}

export function useImageConverter() {
  const config = useRuntimeConfig()

  async function convertImageToWebP(file: File) {
    const fileData = await new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.onload = e => {
        const base64 = e.target?.result as string
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.readAsDataURL(file)
    })

    const response = await $fetch<ImageConvertResponse>(
      `${config.public.cloudFunctionImageConverter}`,
      {
        method: 'POST',
        body: JSON.stringify({
          imageData: fileData,
          fileName: file.name,
        }),
      },
    )

    // Получаем WebP обратно
    const webpFile = new File(
      [Buffer.from(response.imageData, 'base64')],
      response.fileName,
      { type: 'image/webp' },
    )

    return webpFile || null
  }

  return {
    convertImageToWebP,
  }
}

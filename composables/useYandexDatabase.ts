import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()

export interface UploadResponse {
  message: string
  path: string
}

export function useYandexDatabase() {
  async function compressToWebP(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        ctx!.drawImage(img, 0, 0)

        canvas.toBlob(
          blob => {
            const reader = new FileReader()
            reader.onload = e => {
              const base64 = e.target?.result as string
              const base64Data = base64.split(',')[1]

              // Логирование размера
              console.log('Original size:', file.size, 'bytes')
              console.log('WebP size:', blob!.size, 'bytes')
              console.log(
                'Compression ratio:',
                Math.round((1 - blob!.size / file.size) * 100) + '%',
              )

              resolve(base64Data)
            }
            reader.readAsDataURL(blob!)
          },
          'image/webp',
          0.8,
        )
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  async function uploadToMountedBucket(file: File) {
    try {
      // Конвертируем файл в base64
      const fileData = await compressToWebP(file)

      const response = await $fetch<UploadResponse>(
        `${config.public.cloudFunctionPresignedUrl}`,
        {
          method: 'POST',
          body: JSON.stringify({
            fileName: file.name,
            fileData: fileData,
          }),
        },
      )

      return response
    } catch (error) {
      console.log('Upload error:', error)
      throw error
    }
  }

  return {
    uploadToMountedBucket,
  }
}

import type { Product } from '~/types'

export interface CertificateProduct {
  id: number
  title: string
  year: string
  tecnic: string
  material: string
  size: string
}

export interface CertificateRequest {
  purchaseDate: string // ISO дата покупки
  product: CertificateProduct
}

export const usePdfGenerator = () => {
  const config = useRuntimeConfig()
  const functionUrl: string =
    (config.public.cloudFunctionPdfGenerator as string) ||
    'https://functions.yandexcloud.net/d4ertp5k9fuh1q4d18ut'

  /**
   * Генерирует сертификат подлинности для товара
   */
  const generateCertificate = async (
    product: Product,
    purchaseDate: string,
  ): Promise<Blob> => {
    const data: CertificateRequest = {
      purchaseDate,
      product: {
        id: product.id,
        title: product.title,
        year: product.year,
        tecnic: product.tecnic,
        material: product.material,
        size: product.size,
      },
    }

    return await generatePdf(data)
  }

  /**
   * Базовая функция для генерации PDF из подготовленных данных
   */
  const generatePdf = async (data: CertificateRequest): Promise<Blob> => {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Failed to generate PDF: ${response.status} ${response.statusText}. ${errorText}`,
      )
    }

    // Получаем бинарные данные
    const blob = await response.blob()

    // Скачиваем PDF автоматически
    const filename = data.product
      ? `сертификат-${data.product.title.replace(/[^a-zа-яё0-9]/gi, '-')}.pdf`
      : 'сертификат.pdf'
    downloadPdf(blob, filename)

    return blob
  }

  /**
   * Скачивает PDF файл в браузере
   */
  const downloadPdf = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'

    document.body.appendChild(a)
    a.click()

    // Очистка
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  /**
   * Генерирует PDF с возможностью preview в новой вкладке
   */
  const previewCertificate = async (
    product: Product,
    purchaseDate: string,
  ): Promise<void> => {
    const data: CertificateRequest = {
      purchaseDate,
      product: {
        id: product.id,
        title: product.title,
        year: product.year,
        tecnic: product.tecnic,
        material: product.material,
        size: product.size,
      },
    }

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.status}`)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    // Открываем в новой вкладке
    window.open(url, '_blank')

    // Не удаляем URL сразу, даём браузеру время открыть PDF
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 1000)
  }

  return {
    generateCertificate,
    previewCertificate,
  }
}

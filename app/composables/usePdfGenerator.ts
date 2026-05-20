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
  certificateNumber: string // Номер сертификата, например "JK-2026-015"
  purchaseDate: string // ISO дата покупки
  additionalInfo?: string // Дополнительная информация
  product: CertificateProduct
}

export const usePdfGenerator = () => {
  const config = useRuntimeConfig()
  const functionUrl: string =
    (config.public.cloudFunctionPdfGenerator as string) ||
    'https://functions.yandexcloud.net/d4ertp5k9fuh1q4d18ut'

  const { getNextCertificateNumber, saveCertificateIdToProduct } = useCertificateCounter()

  /**
   * Генерирует сертификат подлинности для товара
   */
  const generateCertificate = async (
    product: Product,
    purchaseDate: string,
    additionalInfo?: string,
    manualCertificateNumber?: string,
  ): Promise<Blob> => {
    // Используем ручной номер если указан, иначе генерируем из Firebase
    const certificateNumber = manualCertificateNumber || (await getNextCertificateNumber())

    const data: CertificateRequest = {
      certificateNumber,
      purchaseDate,
      additionalInfo,
      product: {
        id: product.id,
        title: product.title,
        year: product.year,
        tecnic: product.tecnic,
        material: product.material,
        size: product.size,
      },
    }

    // Генерируем PDF
    const blob = await generatePdf(data)

    // Сохраняем номер сертификата в продукт
    await saveCertificateIdToProduct(product.id, certificateNumber)

    return blob
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
    additionalInfo?: string,
    manualCertificateNumber?: string,
  ): Promise<void> => {
    // Используем ручной номер если указан, иначе генерируем из Firebase
    const certificateNumber = manualCertificateNumber || (await getNextCertificateNumber())

    const data: CertificateRequest = {
      certificateNumber,
      purchaseDate,
      additionalInfo,
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

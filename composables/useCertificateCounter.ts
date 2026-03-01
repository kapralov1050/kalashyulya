import { get, ref as dbRef, set } from 'firebase/database'

export interface CertificateNumber {
  number: string // Формат: JK-2026-015
}

const CERTIFICATE_INITIALS = 'JK'

export function useCertificateCounter() {
  /**
   * Получает следующий порядковый номер сертификата для текущего года
   * и формирует полный номер вида JK-2026-015
   */
  const getNextCertificateNumber = async (): Promise<string> => {
    const db = useDatabase()
    const currentYear = new Date().getFullYear()
    const yearRef = dbRef(db, `certificates/${currentYear}`)

    try {
      // Сначала получаем текущее значение
      const snapshot = await get(yearRef)
      const currentCount = snapshot.val()

      // Определяем текущий счетчик
      let count: number
      if (currentCount === null || currentCount === undefined) {
        count = 0
      } else if (typeof currentCount === 'string') {
        count = currentCount === '' ? 0 : parseInt(currentCount, 10)
      } else if (typeof currentCount === 'number') {
        count = currentCount
      } else {
        count = 0
      }

      // Проверяем, что это валидное число
      if (isNaN(count)) {
        count = 0
      }

      // Инкрементируем счетчик
      const nextCount = count + 1
      await set(yearRef, nextCount)

      // Формируем номер сертификата: JK-2026-015
      const certificateNumber = `${CERTIFICATE_INITIALS}-${currentYear}-${String(nextCount).padStart(3, '0')}`

      return certificateNumber
    } catch (error) {
      console.error('Error getting next certificate number:', error)
      throw new Error('Failed to generate certificate number')
    }
  }

  /**
   * Получает текущее количество сертификатов за год (без инкремента)
   */
  const getCurrentCertificateCount = async (year?: number): Promise<number> => {
    const db = useDatabase()
    const targetYear = year ?? new Date().getFullYear()
    const yearRef = dbRef(db, `certificates/${targetYear}`)

    try {
      const snapshot = await get(yearRef)
      const count = snapshot.val() as number | null
      return count ?? 0
    } catch (error) {
      console.error('Error getting certificate count:', error)
      throw new Error('Failed to get certificate count')
    }
  }

  /**
   * Сохраняет номер сертификата в продукт
   */
  const saveCertificateIdToProduct = async (
    productId: number,
    certificateNumber: string,
  ): Promise<void> => {
    const db = useDatabase()
    const productRef = dbRef(db, `shop/products/product_${productId}/certificateId`)

    try {
      await set(productRef, certificateNumber)
    } catch (error) {
      console.error('Error saving certificate ID to product:', error)
      throw new Error('Failed to save certificate ID to product')
    }
  }

  /**
   * Удаляет номер сертификата из продукта
   */
  const removeCertificateIdFromProduct = async (
    productId: number,
  ): Promise<void> => {
    const db = useDatabase()
    const productRef = dbRef(db, `shop/products/product_${productId}/certificateId`)

    try {
      // Получаем текущий certificateId продукта перед удалением
      const productSnapshot = await get(productRef)
      const certificateId = productSnapshot.val() as string | null

      // Удаляем certificateId из продукта
      await set(productRef, null)

      // Если был certificateId, уменьшаем счетчик за год
      if (certificateId) {
        // Извлекаем год из номера (формат: JK-2026-015)
        const yearMatch = certificateId.match(/-(\d{4})-(\d{3})$/)
        if (yearMatch) {
          const year = parseInt(yearMatch[1], 10)
          const yearRef = dbRef(db, `certificates/${year}`)
          const yearSnapshot = await get(yearRef)
          const currentCount = yearSnapshot.val() as number | null

          // Декрементируем счетчик
          if (currentCount !== null && currentCount > 0) {
            await set(yearRef, currentCount - 1)
          }
        }
      }
    } catch (error) {
      console.error('Error removing certificate ID from product:', error)
      throw new Error('Failed to remove certificate ID from product')
    }
  }

  return {
    getNextCertificateNumber,
    getCurrentCertificateCount,
    saveCertificateIdToProduct,
    removeCertificateIdFromProduct,
  }
}

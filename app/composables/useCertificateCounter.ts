import { useApi } from '~/composables/useApi'

const CERTIFICATE_INITIALS = 'JK'

export function useCertificateCounter() {
  const api = useApi()

  async function getNextCertificateNumber(): Promise<string> {
    const currentYear = new Date().getFullYear()
    const res = await $fetch<{ count: number, nextNumber: string }>(
      `/api/admin/certificates/${currentYear}/next`,
      { method: 'POST' },
    )
    return `${CERTIFICATE_INITIALS}-${currentYear}-${String(res.count).padStart(3, '0')}`
  }

  async function getCurrentCertificateCount(year?: number): Promise<number> {
    const targetYear = year ?? new Date().getFullYear()
    const res = await $fetch<{ count: number }>(`/api/admin/certificates/${targetYear}`)
    return res.count
  }

  async function saveCertificateIdToProduct(productId: string, certificateNumber: string): Promise<void> {
    await api.updateProductCertificateId(productId, certificateNumber)
  }

  async function removeCertificateIdFromProduct(productId: string): Promise<void> {
    await api.updateProductCertificateId(productId, null)
  }

  return {
    getNextCertificateNumber,
    getCurrentCertificateCount,
    saveCertificateIdToProduct,
    removeCertificateIdFromProduct,
  }
}
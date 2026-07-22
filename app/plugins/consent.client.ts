export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    useConsent()
    useCookieConsent()
  }
})

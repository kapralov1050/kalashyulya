import { get, set, ref as dbRef } from 'firebase/database'

export const useNewsletter = () => {
  const sendEmail = async (email: string) => {
    const subscribersRef = dbRef(useDatabase(), 'subscribers')
    const snapshot = await get(subscribersRef)
    const subscribers = snapshot.val() || []

    if (!subscribers.includes(email)) {
      await set(subscribersRef, [...subscribers, email])
    }
  }

  return {
    sendEmail,
  }
}

import { getDataByPath } from '~/helpers/firebase/manageDatabase'
import { showToast } from '~/helpers/showToast'

export interface UserProfileData {
  name: string
  email: string
  role: string
  orders?: string[]
}

export const useProfileStore = defineStore('profile', () => {
  const userProfileData = ref<UserProfileData | null>(null)

  async function loadUserData(uid: string) {
    try {
      const snapshot = await getDataByPath(`users/${uid}`)

      if (snapshot) {
        userProfileData.value = snapshot as UserProfileData
      }
    } catch (err) {
      showToast('error', err as string, 'heroicons:exclamation-circle')
    }
  }

  return {
    userProfileData,
    loadUserData,
  }
})

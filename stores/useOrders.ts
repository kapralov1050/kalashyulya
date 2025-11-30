import { useFirebase } from '~/composables/firebase/useFirebase'

export const useOrderStore = defineStore('order', () => {
  const { ordersData } = useFirebase()
})

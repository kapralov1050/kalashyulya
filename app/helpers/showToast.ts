/**
 * @typedef {Object} Toast
 * @property {Function} add - Function to add a toast notification
 */

/**
 * Auto-imported composable from @nuxt/ui
 * @returns {Toast}
 */
declare function useToast(): { add: (options: { title: string; description: string; icon: string }) => void }

export function showToast(title: string, description: string, icon: string) {
  const toast = useToast()

  toast.add({
    title: title,
    description: description,
    icon: icon,
  })
}

export function showToast(title: string, description: string, icon: string) {
  const toast = useToast()

  toast.add({
    title: title,
    description: description,
    icon: icon,
  })
}

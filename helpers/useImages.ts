export function awaitImage() {
  const imagesLoaded = ref(false)

  async function loadImages(imageUrls: string[]) {
    const promises = imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = url
        img.onload = resolve
        img.onerror = reject
      })
    })

    const minDelay = 2000

    const delayPromise = new Promise(resolve => setTimeout(resolve, minDelay))

    await Promise.all([...promises, delayPromise])
    imagesLoaded.value = true
  }

  return {
    imagesLoaded,
    loadImages,
  }
}

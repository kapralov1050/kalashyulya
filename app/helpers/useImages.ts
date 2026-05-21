export function awaitImage() {
  async function loadImages(imageUrls: string[]) {
    const promises = imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = url
        img.onload = resolve
        img.onerror = reject
      })
    })

    const minDelay = 1500

    const delayPromise = new Promise(resolve => setTimeout(resolve, minDelay))

    await Promise.all([...promises, delayPromise])
  }

  return {
    loadImages,
  }
}

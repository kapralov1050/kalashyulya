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

    await Promise.all(promises)
  }

  return {
    loadImages,
  }
}

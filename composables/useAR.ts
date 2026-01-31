/**
 * Composable для работы с AR (Augmented Reality)
 * Позволяет проверить поддержку AR и управлять AR контентом
 */

export interface ARSize {
  width: number
  height: number
}

export const useAR = () => {
  const isARSupported = ref(false)
  const isChecking = ref(true)

  /**
   * Проверяет поддержку AR на устройстве
   */
  const checkARSupport = async (): Promise<boolean> => {
    isChecking.value = true

    // Проверка поддержки WebXR (Android, Chrome)
    const isWebXRSupported = 'xr' in navigator
      ? await (navigator as any).xr?.isSessionSupported('immersive-ar').catch(() => false)
      : false

    // Проверка iOS (AR Quick Look доступен на iOS 12+)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const iosVersionMatch = navigator.userAgent.match(/OS (\d+)_/)
    const iosVersion = iosVersionMatch ? Number.parseInt(iosVersionMatch[1], 10) : 0
    const isARQuickLookSupported = isIOS && iosVersion >= 12

    // Проверка Android (Scene Viewer)
    const isAndroid = /Android/.test(navigator.userAgent)

    isARSupported.value = Boolean(
      isWebXRSupported || isARQuickLookSupported || isAndroid,
    )

    isChecking.value = false
    return isARSupported.value
  }

  /**
   * Парсит размер из строки (формат: "30x40", "30 x 40", "30Х40")
   */
  const parseSize = (sizeString: string): ARSize | null => {
    const match = sizeString?.match(/(\d+)\s*[xXхХ]\s*(\d+)/)
    if (!match) return null

    return {
      width: Number.parseInt(match[1], 10),
      height: Number.parseInt(match[2], 10),
    }
  }

  /**
   * Генерирует URL для AR модели из изображения
   *
   * ВАЖНО: Для production нужна серверная конвертация изображений в GLB формат.
   * Эта функция является заглушкой для MVP.
   *
   * Опции для конвертации:
   * 1. Использовать CDN типа Sketchfab или свой сервер
   * 2. Добавить поле arModel в данные продукта
   * 3. Использовать онлайн сервисы конвертации
   */
  const getARModelUrl = (
    imageUrl: string,
    size?: string,
    arModel?: string,
  ): string => {
    // Если есть готовая AR модель - используем её
    if (arModel) {
      return arModel
    }

    // Для MVP: возвращаем изображение
    // В production здесь должна быть логика конвертации в GLB
    return imageUrl
  }

  /**
   * Открывает AR просмотр напрямую через WebXR API
   * (резервный метод если model-viewer не подходит)
   */
  const openARWithWebXR = async (imageUrl: string, size?: string) => {
    const isSupported = await checkARSupport()
    if (!isSupported) {
      console.warn('AR не поддерживается на этом устройстве')
      return false
    }

    // Для полной реализации WebXR нужно:
    // 1. Создать 3D сцену с Three.js
    // 2. Добавить плоскость с текстурой изображения
    // 3. Запустить AR сессию
    // Это выходит за рамки MVP

    console.info('WebXR AR сессия будет реализована в следующей версии')
    return false
  }

  onMounted(() => {
    checkARSupport()
  })

  return {
    isARSupported: readonly(isARSupported),
    isChecking: readonly(isChecking),
    checkARSupport,
    parseSize,
    getARModelUrl,
    openARWithWebXR,
  }
}

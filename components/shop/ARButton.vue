<template>
  <div class="ar-button-wrapper">
    <!-- model-viewer для AR (скрытый, используется для функционала) -->
    <model-viewer
      v-if="arModelUrl && isARSupported"
      ref="modelViewerRef"
      :src="arModelUrl"
      :alt="alt"
      ar
      ar-modes="webxr scene-viewer quick-look"
      auto-rotate
      camera-controls
      class="hidden"
      style="display: none;"
    />

    <!-- Кнопка для запуска AR -->
    <UButton
      :color="color"
      :disabled="!arModelUrl || !isARSupported"
      :loading="isChecking"
      class="ar-button"
      @click="handleARClick"
    >
      <template #trailing>
        <UIcon name="i-heroicons-cube-transparent" />
      </template>
      {{ buttonText }}
    </UButton>

    <!-- Сообщение если AR не поддерживается -->
    <p v-if="!isARSupported && !isChecking" class="text-xs text-gray-500 mt-2">
      AR не поддерживается на вашем устройстве. Требуется iOS 12+ или Android с ARCore.
    </p>
  </div>
</template>

<script setup lang="ts">
import '@google/model-viewer'

const props = withDefaults(
  defineProps<{
    arModel?: string
    image?: string
    size?: string
    alt?: string
    color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  }>(),
  {
    color: 'neutral',
  },
)

const emit = defineEmits<{
  'ar-not-supported': []
}>()

const modelViewerRef = ref<any>(null)
const isARSupported = ref(false)
const isChecking = ref(true)
const arModelUrl = ref('')

const buttonText = computed(() => {
  if (isChecking.value) return 'Проверка AR...'
  if (!isARSupported.value) return 'AR недоступно'
  return 'Посмотреть в AR'
})

// Проверка поддержки AR
const checkARSupport = async () => {
  isChecking.value = true

  // Проверяем поддержку WebXR (Android, Chrome)
  const isWebXRSupported = 'xr' in navigator
    ? await (navigator as any).xr?.isSessionSupported('immersive-ar').catch(() => false)
    : false

  // Проверяем iOS (AR Quick Look доступен на iOS 12+)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const iosVersionMatch = navigator.userAgent.match(/OS (\d+)_/)
  const iosVersion = iosVersionMatch ? Number.parseInt(iosVersionMatch[1], 10) : 0
  const isARQuickLookSupported = isIOS && iosVersion >= 12

  // Проверяем Android (Scene Viewer или WebXR)
  const isAndroid = /Android/.test(navigator.userAgent)

  isARSupported.value = Boolean(
    isWebXRSupported || isARQuickLookSupported || isAndroid,
  )

  // Устанавливаем URL AR модели
  setupARModel()

  isChecking.value = false

  if (!isARSupported.value) {
    emit('ar-not-supported')
  }
}

// Установка URL AR модели
const setupARModel = () => {
  // Если передана готовая AR модель (.glb файл)
  if (props.arModel) {
    arModelUrl.value = props.arModel
  }
  // Иначе показываем сообщение что нужна AR модель
  else {
    arModelUrl.value = ''
    console.warn(
      'AR модель не найдена. Добавьте поле arModel в продукт с путём к .glb файлу.',
    )
  }
}

const handleARClick = () => {
  if (!isARSupported.value || !arModelUrl.value) return

  // Если есть model-viewer, используем его
  if (modelViewerRef.value) {
    const viewer = modelViewerRef.value
    // Programmatic AR activation
    if (viewer.activateAR) {
      viewer.activateAR()
    } else {
      // Fallback: создаем временную ссылку на AR
      const anchor = document.createElement('a')
      anchor.setAttribute('rel', 'ar')
      anchor.href = arModelUrl.value
      anchor.click()
    }
  }
  // Fallback для iOS AR Quick Look
  else if (arModelUrl.value) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS && props.arModel?.endsWith('.usdz')) {
      // Для iOS нужно .usdz файл
      window.location.href = props.arModel
    }
    // Для Android можно использовать intent
    else if (/Android/.test(navigator.userAgent)) {
      const intent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(arModelUrl.value)}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;end`
      window.location.href = intent
    }
  }
}

onMounted(() => {
  checkARSupport()
})

// Отслеживаем изменения props
watch([() => props.arModel, () => props.image], () => {
  setupARModel()
})
</script>

<style scoped>
.ar-button-wrapper {
  position: relative;
}

model-viewer {
  width: 0;
  height: 0;
}
</style>

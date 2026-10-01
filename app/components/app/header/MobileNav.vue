<template>
  <div ref="menuButtonWrapper" class="lg:hidden">
    <UButton
      color="neutral"
      variant="ghost"
      size="lg"
      square
      icon="heroicons:bars-3"
      aria-label="Открыть меню"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      :class="iconButtonClass"
      @click="isOpen = true"
    />
  </div>

  <USlideover
    v-model:open="isOpen"
    side="top"
    title="Меню"
    :close="false"
    :content="{
      'aria-describedby': undefined,
      onCloseAutoFocus: returnFocus,
    }"
    :ui="{
      content:
        'divide-y-0 border-b border-neutral-200 bg-white shadow-none ring-0 sm:shadow-none sm:ring-0 dark:border-neutral-800 dark:bg-neutral-900',
    }"
  >
    <template #content>
      <div class="container flex h-(--header-height) items-center">
        <AppLogo @click="close" />
        <UButton
          color="neutral"
          variant="ghost"
          size="lg"
          square
          icon="heroicons:x-mark"
          aria-label="Закрыть меню"
          :class="['ml-auto', iconButtonClass]"
          @click="close"
        />
      </div>

      <nav aria-label="Основное меню" class="container pb-6">
        <ul>
          <li v-for="item in items" :key="item.to">
            <NuxtLink
              :to="item.to"
              :prefetch="item.prefetch"
              :aria-current="item.ariaCurrent"
              class="block py-3 text-2xl tracking-[-0.01em]
                text-neutral-900 decoration-1 underline-offset-[6px]
                focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-neutral-900 dark:text-white
                dark:focus-visible:outline-white"
              :class="{ underline: item.ariaCurrent }"
              @click="close"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
  const { items } = useMainNav()

  const isOpen = ref(false)
  const close = () => {
    isOpen.value = false
  }

  const menuButtonWrapper = ref<HTMLElement | null>(null)
  const returnFocus = (event: Event) => {
    event.preventDefault()
    menuButtonWrapper.value?.querySelector('button')?.focus()
  }

  const iconButtonClass =
    'p-2.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
</script>

<template>
  <div ref="root" class="contents">
    <UButton
      v-if="isInBasket"
      to="/basket"
      color="neutral"
      :size="size"
      trailing-icon="heroicons:arrow-right-20-solid"
      v-bind="$attrs"
      @click="trackClick('goToBasket')"
    >
      Оформить заказ
      <span class="sr-only">«{{ product.title.trim() }}»</span>
    </UButton>
    <UButton
      v-else
      color="neutral"
      variant="outline"
      :size="size"
      v-bind="$attrs"
      @click="addToBasket"
    >
      {{ printLocale('shop_item_add_to_basket') }}
      <span class="sr-only">«{{ product.title.trim() }}»</span>
    </UButton>
  </div>
</template>

<script setup lang="ts">
  import type { ButtonProps } from '@nuxt/ui'
  import { useProductInBasket } from '~/composables/useProductInBasket'
  import type { Product } from '~/types'

  defineOptions({ inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      product: Product
      size?: ButtonProps['size']
    }>(),
    { size: 'md' },
  )

  const { printLocale } = useLocales()
  const basketStore = useBasketStore()

  const { isInBasket } = useProductInBasket(props.product.id)

  const trackClick = (name: string) => metrics.trackButtonClick(name)

  const root = ref<HTMLElement | null>(null)

  async function addToBasket() {
    const hadFocus = root.value?.contains(document.activeElement) ?? false

    trackClick('addToBasket')
    const { description, categoryId, tags, ...purchaseParams } = props.product
    basketStore.addShopItemToBasket({ amount: 1, item: purchaseParams })

    if (!hadFocus) return
    await nextTick()
    root.value?.querySelector<HTMLElement>('a[href="/basket"]')?.focus()
  }
</script>

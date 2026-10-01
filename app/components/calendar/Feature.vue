<template>
  <article
    :id="anchorId"
    :aria-labelledby="titleId"
    tabindex="-1"
    class="scroll-mt-[var(--header-height)] outline-none"
  >
    <div
      class="container grid gap-10 py-16 sm:py-24 lg:grid-cols-12 lg:items-center
        lg:gap-x-16 lg:py-28"
    >
      <div class="lg:col-span-7" :class="{ 'lg:order-last': reverse }">
        <div class="relative aspect-[4/3]">
          <Transition name="calendar-photo">
            <img
              :key="active"
              :src="images[active]"
              :alt="imageAlt(active)"
              class="absolute bottom-0 left-0 max-h-full max-w-full bg-neutral-100
                object-contain
                shadow-[0_1px_2px_rgb(0_0_0/0.08),0_24px_48px_-28px_rgb(0_0_0/0.45)]
                dark:bg-neutral-800 dark:shadow-none"
              :class="{ 'lg:right-0 lg:left-auto': reverse }"
            />
          </Transition>
        </div>

        <ul
          v-if="images.length > 1"
          :aria-label="`Фото: ${title}`"
          class="mt-5 flex w-fit max-w-full gap-3 overflow-x-auto p-1
            [scrollbar-width:none]"
          :class="{ 'lg:ml-auto': reverse }"
        >
          <li v-for="(src, index) in images" :key="src" class="shrink-0">
            <button
              type="button"
              :aria-label="imageAlt(index)"
              :aria-current="index === active ? 'true' : undefined"
              class="block size-16 overflow-hidden rounded-sm
                transition-[opacity,box-shadow] duration-150 ease-[ease]
                focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-neutral-900 dark:focus-visible:outline-white
                sm:size-20"
              :class="
                index === active
                  ? 'ring-2 ring-neutral-900 ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-neutral-900'
                  : 'opacity-60 hover:opacity-100'
              "
              @click="active = index"
            >
              <img :src="src" alt="" loading="lazy" class="size-full object-cover" />
            </button>
          </li>
        </ul>
      </div>

      <div class="lg:col-span-5">
        <h2
          :id="titleId"
          class="text-[1.875rem] font-semibold leading-[1.1] tracking-[-0.02em]
            text-balance text-neutral-900 dark:text-white sm:text-[2.25rem]"
        >
          {{ title }}
        </h2>

        <dl v-if="facts.length" class="mt-6 flex flex-wrap gap-x-10 gap-y-4">
          <div v-for="fact in facts" :key="fact.label">
            <dt class="text-sm text-neutral-500 dark:text-neutral-400">
              {{ fact.label }}
            </dt>
            <dd
              class="mt-0.5 font-medium tabular-nums text-neutral-900
                dark:text-white"
            >
              {{ fact.value }}
            </dd>
          </div>
        </dl>

        <p
          v-if="description"
          class="mt-6 max-w-[60ch] whitespace-pre-line text-[1.0625rem]
            leading-[1.75] text-neutral-800 dark:text-neutral-100"
        >
          {{ description }}
        </p>

        <div class="mt-10 flex min-h-12 flex-wrap items-center gap-x-6 gap-y-3">
          <template v-if="isAvailable">
            <p
              class="text-2xl font-semibold leading-none tabular-nums
                text-neutral-900 dark:text-white"
            >
              {{ formatPrice(product.price) }}
            </p>
            <ShopBuyButton :product="product" size="xl" />
          </template>
          <p v-else class="text-lg text-neutral-600 dark:text-neutral-300">
            {{
              product.stock === 0
                ? printLocale('shop_item_sold')
                : printLocale('shop_item_reserved_detail')
            }}
          </p>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
  import ShopBuyButton from '~/components/shop/BuyButton.vue'
  import type { Product } from '~/types'
  import { calendarAnchorId } from '~/utils/calendar'
  import { formatPrice, formatProductSize } from '~/utils/productFormat'

  const props = defineProps<{
    product: Product
    reverse?: boolean
  }>()

  const { printLocale } = useLocales()

  const anchorId = calendarAnchorId(props.product)
  const titleId = `${anchorId}-title`
  const active = ref(0)

  const title = computed(() => props.product.title.trim())

  const images = computed(() =>
    props.product.image.length
      ? props.product.image
      : ['/default-shop-image.png'],
  )

  const imageAlt = (index: number) =>
    images.value.length > 1
      ? `${title.value}, фото ${index + 1} из ${images.value.length}`
      : title.value

  const label = (key: string) => printLocale(key).replace(/:\s*$/, '')

  const facts = computed(() =>
    [
      { label: label('shop_item_size'), value: formatProductSize(props.product.size) },
      { label: label('shop_item_technique'), value: props.product.tecnic?.trim() },
      {
        label: label('shop_item_year'),
        value: props.product.year ? String(props.product.year) : '',
      },
    ].filter(fact => fact.label && fact.value),
  )

  const description = computed(() =>
    (props.product.description || '').replace(/\\n/g, '\n').trim(),
  )

  const isAvailable = computed(
    () => props.product.stock > 0 && !props.product.isReserved,
  )
</script>

<style scoped>
  .calendar-photo-enter-active {
    z-index: 1;
    transition:
      opacity 300ms var(--ease-out-strong),
      filter 300ms var(--ease-out-strong);
  }

  .calendar-photo-leave-active {
    transition: opacity 300ms ease;
  }

  .calendar-photo-enter-from {
    opacity: 0;
    filter: blur(6px);
  }

  .calendar-photo-leave-to {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .calendar-photo-enter-from {
      filter: none;
    }
  }
</style>

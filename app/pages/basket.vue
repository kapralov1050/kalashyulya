<template>
  <div class="container pb-16 pt-10 sm:pb-24 sm:pt-14">
    <h1
      class="text-[2rem] font-bold leading-[1.08] tracking-[-0.02em]
        text-neutral-900 dark:text-white sm:text-5xl"
    >
      {{ printLocale('basket_title') }}
    </h1>

    <div
      v-if="!shoppingCart.length"
      class="mt-10 max-w-2xl rounded-2xl bg-neutral-50 p-8 dark:bg-neutral-900/80"
    >
      <p class="text-lg font-medium text-neutral-900 dark:text-white">
        Корзина пуста
      </p>
      <p class="mt-1 text-neutral-600 dark:text-neutral-300">
        Добавьте работы из магазина — они появятся здесь.
      </p>
      <UButton
        to="/shop"
        color="neutral"
        variant="outline"
        size="lg"
        class="mt-6"
      >
        Перейти в магазин
      </UButton>
    </div>

    <template v-else>
      <div class="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-x-16">
        <ul
          class="divide-y divide-neutral-200 border-y border-neutral-200
            dark:divide-neutral-800 dark:border-neutral-800 lg:col-span-7"
        >
          <li
            v-for="el in shoppingCart"
            :key="el.item.id"
            class="grid grid-cols-[6rem_1fr] gap-x-5 py-6 sm:grid-cols-[8rem_1fr]
              sm:gap-x-8"
          >
            <NuxtLink
              :to="{ path: '/shop', query: { id: String(el.item.id) } }"
              tabindex="-1"
              aria-hidden="true"
              class="self-start"
            >
              <img
                :src="el.item.image[0] || '/default-shop-image.png'"
                alt=""
                :style="{ aspectRatio: getArtworkAspectRatio(el.item.size) }"
                class="h-auto w-full bg-neutral-100
                  shadow-[0_1px_2px_rgb(0_0_0/0.08),0_14px_28px_-18px_rgb(0_0_0/0.4)]
                  dark:bg-neutral-800 dark:shadow-none"
                :class="{ 'opacity-40': !isAvailable(el.item) }"
              />
            </NuxtLink>

            <div class="flex min-w-0 flex-col">
              <div class="flex items-start justify-between gap-4">
                <h2
                  class="text-base font-medium"
                  :class="
                    isAvailable(el.item)
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-500 dark:text-neutral-400'
                  "
                >
                  <NuxtLink
                    :to="{ path: '/shop', query: { id: String(el.item.id) } }"
                    class="rounded-sm decoration-neutral-400 underline-offset-4
                      hover:underline focus-visible:outline-2
                      focus-visible:outline-offset-4
                      focus-visible:outline-neutral-900
                      dark:focus-visible:outline-white"
                  >
                    {{ el.item.title.trim() }}
                  </NuxtLink>
                </h2>
                <p
                  v-if="isAvailable(el.item)"
                  class="shrink-0 text-base font-medium tabular-nums
                    text-neutral-900 dark:text-white"
                >
                  {{ formatPrice(el.item.price * el.amount) }}
                </p>
              </div>

              <p
                v-if="formatProductDetails(el.item)"
                class="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
              >
                {{ formatProductDetails(el.item) }}
              </p>
              <p
                v-if="el.amount > 1 && isAvailable(el.item)"
                class="mt-1 text-sm tabular-nums text-neutral-500
                  dark:text-neutral-400"
              >
                {{ formatPrice(el.item.price) }} за шт.
              </p>
              <p
                v-if="!isAvailable(el.item)"
                class="mt-2 text-sm font-medium text-neutral-900 dark:text-white"
              >
                {{ unavailableLabel(el.item) }} — уберите, чтобы оформить заказ
              </p>

              <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div
                  v-if="el.item.stock > 1 && isAvailable(el.item)"
                  role="group"
                  :aria-label="`Количество: ${el.item.title.trim()}`"
                  class="inline-flex items-center rounded-md ring-1 ring-inset
                    ring-neutral-300 dark:ring-neutral-700"
                >
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    square
                    icon="heroicons:minus-16-solid"
                    aria-label="Уменьшить количество"
                    :disabled="el.amount <= 1"
                    @click="decreaseAmount(el.item)"
                  />
                  <span
                    class="w-8 text-center text-sm tabular-nums text-neutral-900
                      dark:text-white"
                    aria-live="polite"
                  >
                    {{ el.amount }}
                  </span>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    square
                    icon="heroicons:plus-16-solid"
                    aria-label="Увеличить количество"
                    :disabled="el.amount >= el.item.stock"
                    @click="increaseAmount(el.item)"
                  />
                </div>

                <button
                  type="button"
                  class="rounded-sm text-sm text-neutral-600 underline
                    decoration-neutral-300 underline-offset-4 transition-colors
                    hover:text-neutral-900 hover:decoration-neutral-900
                    focus-visible:outline-2 focus-visible:outline-offset-4
                    focus-visible:outline-neutral-900 dark:text-neutral-300
                    dark:decoration-neutral-600 dark:hover:text-white
                    dark:hover:decoration-white dark:focus-visible:outline-white"
                  @click="deleteShopItemFromBasket(el.item)"
                >
                  Убрать
                  <span class="sr-only">«{{ el.item.title.trim() }}»</span>
                </button>
              </div>
            </div>
          </li>
        </ul>

        <aside aria-labelledby="basket-summary" class="lg:col-span-5">
          <div class="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
            <h2
              id="basket-summary"
              class="text-lg font-semibold text-neutral-900 dark:text-white"
            >
              Итого
            </h2>

            <dl
              class="mt-4 border-y border-neutral-200 py-3 text-[0.9375rem]
                dark:border-neutral-800"
            >
              <div class="flex items-baseline justify-between gap-6">
                <dt class="text-neutral-600 dark:text-neutral-300">
                  Товары ({{ availableQty }})
                </dt>
                <dd
                  class="text-xl font-semibold tabular-nums text-neutral-900
                    dark:text-white"
                >
                  {{ formatPrice(availableAmount) }}
                </dd>
              </div>
            </dl>

            <p class="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              Доставка и оформление оплачиваются отдельно — выберете их при
              оформлении заказа.
            </p>

            <UButton
              color="neutral"
              size="xl"
              block
              class="mt-6"
              :disabled="hasUnavailable || !availableQty"
              @click="startOrder"
            >
              Оформить заказ
            </UButton>
            <p
              v-if="hasUnavailable"
              class="mt-2 text-sm text-neutral-600 dark:text-neutral-300"
            >
              Уберите недоступные работы, чтобы продолжить.
            </p>

            <NuxtLink
              to="/shop"
              class="mt-5 inline-block rounded-sm text-[0.9375rem] text-neutral-900
                underline decoration-neutral-300 underline-offset-4
                hover:decoration-neutral-900 focus-visible:outline-2
                focus-visible:outline-offset-4 focus-visible:outline-neutral-900
                dark:text-white dark:decoration-neutral-600
                dark:hover:decoration-white dark:focus-visible:outline-white"
            >
              Продолжить покупки
            </NuxtLink>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { Product, PurchaseParams } from '~/types'
  import {
    formatPrice,
    formatProductDetails,
    getArtworkAspectRatio,
  } from '~/utils/productFormat'

  const router = useRouter()
  const { printLocale } = useLocales()
  const { deleteShopItemFromBasket, loadPurchase, changeShopItemQty } =
    useBasketStore()
  const { shoppingCart } = storeToRefs(useBasketStore())
  const shopStore = useShopStore()

  useSeo({ title: 'Корзина' })

  const liveProducts = computed<Product[]>(() => {
    const data = shopStore.shopData
    if (!data || data instanceof Error) return []
    return Object.values(data.products ?? {})
  })

  const findLive = (item: PurchaseParams) =>
    liveProducts.value.find(p => String(p.id) === String(item.id))

  const isAvailable = (item: PurchaseParams) => {
    if (!liveProducts.value.length) return true
    const live = findLive(item)
    return !!live && live.stock > 0 && !live.isReserved
  }

  const unavailableLabel = (item: PurchaseParams) => {
    const live = findLive(item)
    if (!live) return 'Больше нет в продаже'
    if (live.stock === 0) return 'Уже продано'
    return 'Забронировано'
  }

  const availableItems = computed(() =>
    shoppingCart.value.filter(el => isAvailable(el.item)),
  )
  const availableQty = computed(() =>
    availableItems.value.reduce((acc, el) => acc + el.amount, 0),
  )
  const availableAmount = computed(() =>
    availableItems.value.reduce((acc, el) => acc + el.item.price * el.amount, 0),
  )
  const hasUnavailable = computed(
    () => availableItems.value.length < shoppingCart.value.length,
  )

  function startOrder() {
    metrics.trackButtonClick('startOrderButton')
    router.push('/shop/checkout')
  }

  const decreaseAmount = (purchaseItem: PurchaseParams) =>
    changeShopItemQty(-1, purchaseItem)

  const increaseAmount = (purchaseItem: PurchaseParams) =>
    changeShopItemQty(1, purchaseItem)

  onMounted(() => {
    loadPurchase()
  })
</script>

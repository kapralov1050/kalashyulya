<template>
  <article class="container">
    <UForm
      :schema="orderSchema"
      :state="formData"
      class="flex flex-col gap-y-4"
      @submit="submitOrder"
      @focusin.once="() => metrics.trackButtonClick('checkoutStarted')"
    >
      <div class="space-y-4">
        <UFormField name="name" :label="printLocale('order_form_name_label')">
          <UInput
            v-model="formData.name"
            size="xl"
            type="text"
            :placeholder="printLocale('order_form_name_placeholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField name="email" :label="printLocale('order_form_email_label')">
          <UInput
            v-model="formData.email"
            size="xl"
            type="email"
            :placeholder="printLocale('order_form_email_placeholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField name="messenger" :label="printLocale('order_form_contact_label')">
          <UCheckboxGroup
            v-model="messengerType"
            orientation="horizontal"
            variant="list"
            :items="items"
          />
        </UFormField>
        <UFormField
          v-if="messengerType.includes('Звонок')"
          name="phone"
          :label="printLocale('order_form_phone_label')"
        >
          <UInput
            v-model="formData.phone"
            size="xl"
            type="text"
            :placeholder="printLocale('order_form_phone_placeholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField
          v-if="
            ['Вконтакте', 'Телеграм'].some(item => messengerType.includes(item))
          "
          name="nickname"
          :label="printLocale('order_form_nickname_label')"
        >
          <UInput
            v-model="formData.nickname"
            size="xl"
            type="text"
            :placeholder="printLocale('order_form_nickname_placeholder')"
            class="w-full"
          />
        </UFormField>
      </div>

      <UCheckbox
        v-if="messengerType.length > 0"
        v-model="isDelivery"
        :label="printLocale('order_form_delivery_checkbox')"
      />

      <div v-if="isDelivery" class="space-y-4">
        <h3 class="text-xl font-bold">{{ printLocale('order_form_delivery_title') }}</h3>
        <UFormField name="address" :label="printLocale('order_form_address_label')">
          <UInput
            v-model="addressQuery"
            size="xl"
            type="text"
            :placeholder="printLocale('order_form_address_placeholder')"
            class="w-full"
            @input="
              (e: Event) => fetchAddresses((e.target as HTMLInputElement).value)
            "
          />
          <div v-if="suggestions.length > 0" class="mt-2 border rounded-lg">
            <div
              v-for="suggestion in suggestions"
              :key="suggestion.value"
              class="p-2 hover:bg-gray-100 cursor-pointer"
              @click="selectAddress(suggestion)"
            >
              {{ suggestion.value }}
            </div>
          </div>
        </UFormField>
        <UFormField name="city" :label="printLocale('order_form_city_label')">
          <UInput
            v-model="formData.city"
            size="xl"
            type="text"
            :placeholder="printLocale('order_form_city_placeholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField name="recipient" :label="printLocale('order_form_recipient_label')">
          <UInput
            v-model="formData.recipient"
            size="xl"
            type="text"
            :placeholder="printLocale('order_form_recipient_placeholder')"
            class="w-full"
          />
        </UFormField>
        <div class="grid grid-cols-3 gap-4">
          <UFormField name="street" :label="printLocale('order_form_street_label')">
            <UInput
              v-model="formData.street"
              size="xl"
              type="text"
              :placeholder="printLocale('order_form_street_placeholder')"
              class="w-full"
            />
          </UFormField>
          <UFormField name="house" :label="printLocale('order_form_house_label')">
            <UInput
              v-model="formData.house"
              size="xl"
              type="text"
              :placeholder="printLocale('order_form_house_placeholder')"
              class="w-full"
            />
          </UFormField>
          <UFormField name="apartment" :label="printLocale('order_form_apartment_label')">
            <UInput
              v-model="formData.apartment"
              size="xl"
              type="text"
              :placeholder="printLocale('order_form_apartment_placeholder')"
              class="w-full"
            />
          </UFormField>
        </div>
      </div>

      <UButton
        loading-auto
        type="submit"
        size="xl"
        class="self-center"
        variant="outline"
        color="neutral"
        :disabled="!isFormValid || isSending"
        @click="submitOrder"
      >
        {{ isSending ? printLocale('order_form_sending') : printLocale('order_form_submit') }}
      </UButton>
    </UForm>
  </article>
</template>

<script setup lang="ts">
  import type { CheckboxGroupItem } from '@nuxt/ui'
  import { computed } from 'vue'
  import { useFirebase } from '~/composables/firebase/useFirebase'
  import { updateDataByPath } from '~/helpers/firebase/manageDatabase'
  import { showToast } from '~/helpers/showToast'
  import { orderSchema } from '~/helpers/valibot'
  import type { DaDataSuggestion, Order } from '~/types'

  const { printLocale } = useLocales()

  const emit = defineEmits<{
    closeModal: []
    successOrder: [orderId: string]
  }>()

  const { suggestions, fetchAddresses } = useDaDataAddress()
  const basketStore = useBasketStore()
  const { sendOrderInfoTelegram, sendOrderInfoEmail } = useShop()
  const { addNewOrder, shopData } = useFirebase()
  const { orderInfo } = storeToRefs(useOrdersStore())

  const addressQuery = ref('')
  const isSending = shallowRef(false)
  const isDelivery = shallowRef(false)
  const items = ref<CheckboxGroupItem[]>(['Вконтакте', 'Телеграм', 'Звонок'])
  const messengerType = ref<string[]>([])

  // Сбрасываем доставку, если убраны все способы связи
  watch(messengerType, newVal => {
    if (newVal.length === 0) {
      isDelivery.value = false
    }
  })

  const formData = reactive({
    name: '',
    phone: '',
    email: '',
    city: '',
    recipient: '',
    street: '',
    house: '',
    apartment: '',
    nickname: '',
  })

  const selectAddress = (suggestion: DaDataSuggestion) => {
    const { city, street, house } = suggestion.data
    formData.city = city || ''
    formData.street = street || ''
    formData.house = house || ''
    suggestions.value = []
    addressQuery.value = suggestion.value
    formData.apartment = suggestion.data.house || ''
    formData.apartment = suggestion.data.flat || ''
  }

  // Поле содержит хотя бы одну букву или цифру (не просто тире/пробелы)
  const hasContent = (value: string) =>
    /[a-zA-Zа-яёА-ЯЁ0-9]/.test(value.trim())

  // ФИО — минимум два слова с буквами
  const hasFullName = (value: string) =>
    value
      .trim()
      .split(/\s+/)
      .filter(w => /[a-zA-Zа-яёА-ЯЁ]/.test(w)).length >= 2

  const isFormValid = computed(() => {
    const baseFields = hasContent(formData.name) && formData.email.trim()
    const messengerRequired = messengerType.value.length > 0
    const phoneRequired = messengerType.value.includes('Звонок')
      ? formData.phone.trim()
      : true
    const nicknameRequired = ['Вконтакте', 'Телеграм'].some(item =>
      messengerType.value.includes(item),
    )
      ? hasContent(formData.nickname)
      : true

    if (!isDelivery.value) {
      return (
        baseFields && messengerRequired && phoneRequired && nicknameRequired
      )
    }

    return (
      baseFields &&
      messengerRequired &&
      phoneRequired &&
      nicknameRequired &&
      hasContent(formData.city) &&
      hasFullName(formData.recipient) &&
      hasContent(formData.street) &&
      (hasContent(formData.house) || hasContent(formData.apartment))
    )
  })

  async function submitOrder() {
    if (isSending.value) return
    try {
      const products = Object.values(shopData.value?.products ?? {})
      const soldOut = basketStore.shoppingCart.filter(purchase => {
        const current = products.find(p => p.id === purchase.item.id)
        return !current || current.stock === 0 || current.isReserved
      })

      if (soldOut.length > 0) {
        metrics.trackButtonClick('stockCheckFailed')
        showToast(
          'Товары недоступны',
          soldOut.map(p => p.item.title).join(', ') + ' — уже нет в наличии',
          'heroicons:exclamation-circle',
        )
        return
      }

      const orderData: Order = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          userMessenger: messengerType.value.join(', '),
          userNickname: formData.nickname,
          delivery: {
            city: formData.city,
            recipient: formData.recipient,
            street: formData.street,
            house: formData.house,
            apartment: formData.apartment,
          },
        },
        purchase: {
          order: basketStore.shortPurchaseInfo,
          createdAt: new Date().toISOString(),
        },
        totalPrice: basketStore.totalPurchaseAmount,
      }

      orderInfo.value = orderData

      metrics.trackButtonClick('completeOrderButton')

      isSending.value = true

      const orderId = await addNewOrder(orderInfo.value, 'orders/')

      const isTestOrder = ['localhost', '127.0.0.1', 'kalashyulya.vercel.app'].some(
        host => window.location.href.includes(host),
      )

      if (isTestOrder) {
        // eslint-disable-next-line no-console
        console.debug('[order] test environment — notifications skipped')
      } else {
        const [telegramResult, emailResult] = await Promise.allSettled([
          sendOrderInfoTelegram(orderInfo.value),
          sendOrderInfoEmail(orderInfo.value),
        ])

        const failed: { telegram?: boolean; email?: boolean } = {}
        if (telegramResult.status === 'rejected' || !telegramResult.value?.success)
          failed.telegram = true
        if (emailResult.status === 'rejected' || !emailResult.value?.success)
          failed.email = true
        if (Object.keys(failed).length > 0)
          updateDataByPath({ notificationFailed: failed }, `orders/order_${orderId}`)
      }

      basketStore.clearBasket()
      metrics.trackButtonClick('orderSuccess')
      emit('successOrder', orderId)
    } catch {
      metrics.trackButtonClick('orderError')
      showToast(
        'Ошибка оформления заказа',
        'Повторите позже',
        'heroicons:exclamation-circle',
      )
      emit('closeModal')
    } finally {
      isSending.value = false
    }
  }
</script>

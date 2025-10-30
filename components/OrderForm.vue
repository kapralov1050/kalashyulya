<template>
  <article class="container">
    <UForm
      :schema="orderSchema"
      :state="formData"
      class="flex flex-col gap-y-4"
      @submit="submitOrder"
    >
      <div class="space-y-4">
        <h3 class="text-xl font-bold">Покупатель</h3>
        <UFormField name="name" label="Ваше имя">
          <UInput
            v-model="formData.name"
            size="xl"
            type="text"
            placeholder="Введите ваше имя"
            class="w-full"
          />
        </UFormField>
        <UFormField name="email" label="Ваш email">
          <UInput
            v-model="formData.email"
            size="xl"
            type="email"
            placeholder="Введите ваш email"
            class="w-full"
          />
        </UFormField>
        <UFormField name="phone" label="Ваш телефон">
          <UInput
            v-model="formData.phone"
            size="xl"
            type="text"
            placeholder="Введите ваш номер телефона"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="space-y-4">
        <h3 class="text-xl font-bold">Доставка</h3>
        <UFormField name="address" label="Адрес">
          <UInput
            v-model="addressQuery"
            size="xl"
            type="text"
            placeholder="Введите адрес"
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
        <UFormField name="city" label="Город">
          <UInput
            v-model="formData.city"
            size="xl"
            type="text"
            placeholder="Введите город"
            class="w-full"
          />
        </UFormField>
        <UFormField name="recipient" label="Получатель (ФИО полностью)">
          <UInput
            v-model="formData.recipient"
            size="xl"
            type="text"
            placeholder="Введите ФИО получателя"
            class="w-full"
          />
        </UFormField>
        <div class="grid grid-cols-3 gap-4">
          <UFormField name="street" label="Улица">
            <UInput
              v-model="formData.street"
              size="xl"
              type="text"
              placeholder="улица"
              class="w-full"
            />
          </UFormField>
          <UFormField name="house" label="Дом">
            <UInput
              v-model="formData.house"
              size="xl"
              type="text"
              placeholder="дом"
              class="w-full"
            />
          </UFormField>
          <UFormField name="apartment" label="Квартира">
            <UInput
              v-model="formData.apartment"
              size="xl"
              type="text"
              placeholder="квартира"
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
      >
        {{ isSending ? 'Отправка...' : 'Отправить' }}
      </UButton>
    </UForm>
  </article>
</template>

<script setup lang="ts">
  import { showToast } from '~/helpers/showToast'
  import { orderSchema } from '~/helpers/valibot'
  import type { Order, DaDataSuggestion } from '~/types'

  const {
    suggestions,
    isLoading: isAddressLoading,
    error: addressError,
    fetchAddresses,
  } = useDaDataAddress()
  const addressQuery = ref('')
  const isSending = shallowRef(false)

  const selectAddress = (suggestion: DaDataSuggestion) => {
    const { city, street, house } = suggestion.data
    formData.city = city || ''
    formData.street = street || ''
    formData.house = house || ''
    suggestions.value = []
    addressQuery.value = suggestion.value
  }

  const emit = defineEmits(['closeModal'])
  const basketStore = useBasketStore()
  const { sendOrderInfoTelegram, sendOrderInfoEmail } = useShop()

  const formData = reactive({
    name: '',
    phone: '',
    email: '',
    city: '',
    recipient: '',
    street: '',
    house: '',
    apartment: '',
  })

  const submitOrder = async () => {
    const orderInfo: Order = {
      customer: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
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

    console.log('Отправка заказа:', orderInfo)

    isSending.value = true

    await sendOrderInfoTelegram(orderInfo)
    await sendOrderInfoEmail(orderInfo)

    showToast(
      'Заказ успешно оформлен',
      'В ближайшее время я с вами свяжусь',
      'heroicons:check-circle',
    )

    isSending.value = false
    emit('closeModal')
  }
</script>

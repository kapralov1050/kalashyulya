<template>
  <article class="container">
    <form class="flex flex-col gap-y-4">
      <AppFormField
        id="name"
        v-model="formData.name"
        type="text"
        placeholder="Введите ваше имя"
        label="Имя"
        class="w-70% sm:w-96"
      />

      <AppFormField
        id="phone"
        v-model="formData.phone"
        type="tel"
        placeholder="Введите ваш телефон"
        label="Телефон"
        class="w-70% sm:w-96"
      />

      <AppFormField
        id="email"
        v-model="formData.email"
        type="email"
        placeholder="Введите ваш email (необязательно)"
        label="Email"
        class="w-70% sm:w-96"
      />

      <AppFormField
        id="address"
        v-model="formData.address"
        type="text"
        placeholder="Введите адрес доставки"
        label="Адрес"
        class="w-70% sm:w-96"
      />

      <AppFormField
        id="comment"
        v-model="formData.comment"
        type="textarea"
        placeholder="Комментарий к заказу"
        label="Комментарий"
        class="w-70% sm:w-96"
      />

      <UButton
        loading-auto
        size="xl"
        class="self-center"
        variant="outline"
        @click.prevent="submitOrder"
      >
        {{ isSending ? 'Отправка...' : 'Отправить' }}
      </UButton>
    </form>
  </article>
</template>

<script setup lang="ts">
  import { showToast } from '~/helpers/showToast'
  import type { Order } from '~/types'

  const isSending = ref(false)

  const emit = defineEmits(['closeModal'])
  const basketStore = useBasketStore()
  const { sendOrderInfoTelegram, sendOrderInfoEmail } = useShop()

  const formData = reactive({
    name: '',
    phone: '',
    email: '',
    address: '',
    comment: '',
  })

  const submitOrder = async () => {
    const orderInfo: Order = {
      customer: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        comment: formData.comment,
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

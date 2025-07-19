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

      <AppButton @click.prevent="submitOrder">Отправить</AppButton>
    </form>
  </article>
</template>

<script setup lang="ts">
  import type { Order } from '~/types'

  const basketStore = useBasketStore()
  const { sendOrder } = useShop()

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

    const { success, data } = await sendOrder(orderInfo)

    console.log(success, data)
  }
</script>

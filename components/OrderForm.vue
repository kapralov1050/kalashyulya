<template>
  <article class="container">
    <UForm
      :schema="orderSchema"
      :state="formData"
      class="flex flex-col gap-y-4"
      @submit="submitOrder"
    >
      <UFormField name="name" label="Имя">
        <UInput
          v-model="formData.name"
          size="xl"
          type="text"
          placeholder="Введите ваше Имя"
          class="w-full"
        />
      </UFormField>
      <UFormField name="phone" label="Телефон">
        <UInput
          v-model="formData.phone"
          size="xl"
          type="text"
          placeholder="Введите ваш номер телефона"
          class="w-full"
        />
      </UFormField>

      <UFormField name="email" label="Email">
        <UInput
          v-model="formData.email"
          size="xl"
          type="email"
          placeholder="Введите ваш Email"
          class="w-full"
        />
      </UFormField>

      <UFormField name="address" label="Адрес">
        <UInput
          v-model="formData.address"
          size="xl"
          type="text"
          placeholder="Введите ваш адрес"
          class="w-full"
        />
      </UFormField>

      <UFormField name="comment" label="Комментарий">
        <UInput
          v-model="formData.comment"
          size="xl"
          type="text"
          placeholder="Введите ваш комментарий"
          class="w-full"
        />
      </UFormField>

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
  import type { orderSchemaType } from '~/helpers/valibot'
  import type { Order } from '~/types'
  import type { FormSubmitEvent } from '@nuxt/ui'

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

  const submitOrder = async (event: FormSubmitEvent<orderSchemaType>) => {
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

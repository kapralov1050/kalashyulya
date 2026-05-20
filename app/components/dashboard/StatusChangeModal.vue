<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      overlay: 'bg-black/60 backdrop-blur-sm',
      content: 'w-full max-w-lg p-0 rounded-2xl',
    }"
  >
    <template #content>
      <div class="flex flex-col">
        <div
          class="flex items-center justify-between border-b border-neutral-200
            px-6 py-4 dark:border-neutral-700"
        >
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
            Изменение статуса заказа
          </h3>
          <UButton
            icon="i-heroicons-x-mark"
            variant="ghost"
            color="neutral"
            class="rounded-full"
            @click="closeModal"
          />
        </div>

        <div class="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
            <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Заказ #{{ order?.id }}
            </p>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Клиент: {{ order?.customer.name || 'Не указано' }}
            </p>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              Email: {{ order?.customer.email || 'Не указан' }}
            </p>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p class="text-sm font-medium text-neutral-900 dark:text-white mb-1">
              Новый статус: {{ newStatus }}
            </p>
            <p class="text-xs text-neutral-600 dark:text-neutral-400">
              После подтверждения на адрес {{ order?.customer.email }} будет
              отправлено уведомление
            </p>
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Сообщение клиенту
              <span class="text-neutral-400 font-normal">(необязательно)</span>
            </label>
            <UTextarea
              v-model="message"
              :rows="4"
              placeholder="Дополнительная информация о статусе заказа..."
              variant="outline"
              color="neutral"
            />
          </div>

          <div class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
              Предпросмотр письма:
            </p>
            <div class="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{{ emailPreview }}</div>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-3 border-t border-neutral-200
            px-6 py-4 dark:border-neutral-700"
        >
          <UButton variant="ghost" color="neutral" @click="closeModal">
            Отмена
          </UButton>
          <UButton color="primary" variant="solid" @click="handleConfirm">
            Отправить уведомление
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import type { OrderInBase } from '~/types'

  interface Props {
    open: boolean
    order: OrderInBase | null
    newStatus: string
  }

  interface Emits {
    (e: 'update:open', value: boolean): void
    (e: 'confirm', data: { orderId: number; status: string; message: string }): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const isOpen = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value),
  })

  const message = ref('')

  const emailPreview = computed(() => {
    if (!props.order) return ''
    const orderItems = props.order.purchase.order
      .map(
        item =>
          `  - ${item.title} (${item.amount} шт. × ${item.price} ₽ = ${item.amount * item.price} ₽)`,
      )
      .join('\n')

    return `"${props.order.customer.name}", здравствуйте!

Ваш заказ был изменен на статус: "${props.newStatus}"

Состав заказа:
${orderItems}

Итого: ${props.order.totalPrice} ₽${message.value ? '\n\n' + message.value : ''}

---
@kalashyulya
Юлия Калашникова`
  })

  function closeModal() {
    message.value = ''
    emit('update:open', false)
  }

  function handleConfirm() {
    if (!props.order) return
    emit('confirm', {
      orderId: props.order.id,
      status: props.newStatus,
      message: message.value,
    })
    message.value = ''
  }
</script>

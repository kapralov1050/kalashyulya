<template>
  <div class="orders-dashboard p-4">
    <div
      class="flex flex-col md:flex-row justify-between items-start mb-6 gap-4"
    >
      <h2 class="text-2xl font-bold">Заказы</h2>
      <div class="w-full md:w-64">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Фильтр по статусу:
        </label>
        <select
          v-model="selectedStatus"
          class="w-full px-3 py-2 rounded-md border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Все заказы</option>
          <option v-for="status in ORDER_STATUS_OPTIONS" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="!allOrders" class="text-center py-8">Загрузка данных...</div>

    <div
      v-for="(order, key) in filteredOrders"
      :key="key"
      class="order-card mb-6 p-6 bg-white rounded-lg shadow-md transition-all
        hover:shadow-lg border-l-4"
      :class="getStatusBorderClass(order.status)"
    >
      <div
        class="order-header flex flex-col md:flex-row justify-between
          items-start mb-4 gap-4"
      >
        <div>
          <h3 class="text-xl font-semibold mb-2">Заказ #{{ order.id }}</h3>
          <div class="flex items-center gap-2 text-gray-500 text-sm">
            <span class="material-icons-outlined text-base">event</span>
            <span>
              {{ new Date(order.purchase.createdAt).toLocaleDateString() }}
            </span>
          </div>
        </div>
        <div
          class="flex flex-col items-start md:items-end gap-3 w-full md:w-auto"
        >
          <div class="flex items-center gap-2">
            <span class="material-icons-outlined">attach_money</span>
            <span class="text-lg font-bold">{{ order.totalPrice }} ₽</span>
          </div>
          <div
            class="flex flex-col md:flex-row items-start md:items-center gap-2
              w-full"
          >
            <select
              v-model="pendingStatuses[order.id]"
              class="px-3 py-2 rounded-md border w-full md:w-48"
              :class="getStatusBgClass(pendingStatuses[order.id])"
            >
              <option v-for="status in ORDER_STATUS_OPTIONS" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
            <UButton
              color="primary"
              variant="solid"
              class="w-full md:w-auto"
              :disabled="pendingStatuses[order.id] === order.status"
              @click="openStatusModal(order)"
            >
              Обновить статус
            </UButton>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="customer-info bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium mb-3 flex items-center gap-2">
            Информация о клиенте:
          </h4>
          <ul class="space-y-2">
            <li class="flex items-center gap-2">
              <span class="material-icons-outlined text-sm text-gray-500">
                имя
              </span>
              {{ order.customer.name || 'Не указано' }}
            </li>
            <li class="flex items-center gap-2">
              <span class="material-icons-outlined text-sm text-gray-500">
                телефон
              </span>
              {{ order.customer.phone || 'Не указано' }}
            </li>
            <li v-if="order.customer.email" class="flex items-center gap-2">
              <span class="material-icons-outlined text-sm text-gray-500">
                почта
              </span>
              {{ order.customer.email }}
            </li>
            <li
              v-if="order.customer.userNickname"
              class="flex items-center gap-2"
            >
              <span class="material-icons-outlined text-sm text-gray-500">
                соцсети
              </span>
              {{ order.customer.userMessenger || 'Мессенджер' }}: @{{
                order.customer.userNickname
              }}
            </li>
          </ul>
        </div>

        <div class="delivery-info bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium mb-3 flex items-center gap-2">
            Адрес доставки:
          </h4>
          <div class="space-y-1">
            <p v-if="order.customer.delivery" class="flex items-center gap-2">
              <span class="material-icons-outlined text-sm text-gray-500">
                адрес
              </span>
              {{ order.customer.delivery.city || 'Город не указан' }}, ул.
              {{ order.customer.delivery.street || 'улица не указана' }}, д.
              {{ order.customer.delivery.house || 'не указан' }}
              <span v-if="order.customer.delivery.apartment">
                , кв. {{ order.customer.delivery.apartment }}
              </span>
            </p>
            <p v-else class="text-gray-500">Адрес не указан</p>
          </div>
        </div>
      </div>
      <div class="order-items mt-6">
        <h4 class="font-medium mb-3 flex items-center gap-2">Состав заказа:</h4>
        <div class="border rounded-lg overflow-hidden">
          <div
            v-for="(item, index) in order.purchase.order"
            :key="index"
            class="item flex justify-between items-center px-4 py-3 bg-white
              even:bg-gray-50"
          >
            <span class="flex-1">{{ item.title }}</span>
            <span class="w-32 text-right">
              {{ item.amount }} × {{ item.price }} ₽
            </span>
            <span class="w-24 text-right font-medium">
              {{ item.amount * item.price }} ₽
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно изменения статуса -->
    <StatusChangeModal
      v-model:open="isStatusModalOpen"
      :order="selectedOrder"
      :new-status="pendingStatuses[selectedOrder?.id || 0]"
      @confirm="handleStatusConfirm"
    />
  </div>
</template>
<script setup lang="ts">
  import type { OrderInBase } from '~/types'
  import { computed, ref, watch } from 'vue'
  import { useFirebase } from '~/composables/firebase/useFirebase'
  import { useOrderEmail } from '~/composables/useOrderEmail'
  import {
    ORDER_STATUS_OPTIONS,
    getOrderStatusColor,
  } from '~/constants/orders'
  import StatusChangeModal from './StatusChangeModal.vue'

  const { allOrders } = storeToRefs(useOrdersStore())
  const { updateOrderStatus } = useFirebase()
  const { sendStatusUpdateEmail } = useOrderEmail()
  const toast = useToast()

  const selectedStatus = ref('all')
  const isStatusModalOpen = ref(false)
  const selectedOrder = ref<OrderInBase | null>(null)
  const pendingStatuses = ref<Record<number, string>>({})

  const filteredOrders = computed(() => {
    if (!allOrders.value) return []
    if (selectedStatus.value === 'all') return allOrders.value
    return allOrders.value.filter(
      order => order.status === selectedStatus.value,
    )
  })

  // Инициализация pending statuses при загрузке заказов
  watch(
    allOrders,
    orders => {
      if (orders) {
        orders.forEach(order => {
          if (!(order.id in pendingStatuses.value)) {
            pendingStatuses.value[order.id] = order.status
          }
        })
      }
    },
    { immediate: true },
  )

  function openStatusModal(order: OrderInBase) {
    const newStatus = pendingStatuses.value[order.id]
    if (newStatus === order.status) {
      toast.add({
        title: 'Внимание',
        description: 'Статус не изменился',
        color: 'warning',
      })
      return
    }
    selectedOrder.value = order
    isStatusModalOpen.value = true
  }

  async function handleStatusConfirm(data: {
    orderId: number
    status: string
    message: string
  }) {
    try {
      const order = allOrders.value?.find(o => o.id === data.orderId)
      if (!order) {
        throw new Error('Заказ не найден')
      }

      // Обновляем статус в Firebase
      await updateOrderStatus(data.orderId, data.status)

      // Отправляем email уведомление
      const emailResult = await sendStatusUpdateEmail(
        order,
        data.status,
        data.message,
      )

      if (emailResult.success) {
        toast.add({
          title: 'Успешно',
          description: `Статус заказа #${data.orderId} обновлен, уведомление отправлено`,
          color: 'success',
        })
      } else {
        toast.add({
          title: 'Предупреждение',
          description: `Статус обновлен, но email не отправлен: ${emailResult.error}`,
          color: 'warning',
        })
      }

      // Обновляем pending status
      pendingStatuses.value[data.orderId] = data.status
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating order status:', error)
      toast.add({
        title: 'Ошибка',
        description: 'Не удалось обновить статус заказа',
        color: 'error',
      })
    } finally {
      isStatusModalOpen.value = false
      selectedOrder.value = null
    }
  }

  function getStatusBorderClass(status: string): string {
    const color = getOrderStatusColor(status)
    return `border-${color}-500`
  }

  function getStatusBgClass(status: string): string {
    const color = getOrderStatusColor(status)
    return `bg-${color}-100 border-${color}-300 text-${color}-800`
  }
</script>
<style scoped>
  .orders-dashboard {
    max-width: 1400px;
    margin: 0 auto;
  }
  .order-card {
    border: 1px solid #e5e7eb;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }
  .order-card:hover {
    transform: translateY(-2px);
  }
  .item {
    transition: background-color 0.2s ease;
  }
</style>

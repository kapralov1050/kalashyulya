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
          <option value="Новый заказ">Новый заказ</option>
          <option value="В работе">В работе</option>
          <option value="Оплачен">Оплачен</option>
          <option value="Отправлен">Отправлен</option>
        </select>
      </div>
    </div>

    <div v-if="!allOrders" class="text-center py-8">Загрузка данных...</div>

    <div
      v-for="(order, key) in filteredOrders"
      :key="key"
      class="order-card mb-6 p-6 bg-white rounded-lg shadow-md transition-all
        hover:shadow-lg border-l-4"
      :class="{
        'border-blue-500': order.status === 'Новый заказ',
        'border-yellow-500': order.status === 'В работе',
        'border-green-500': order.status === 'Оплачен',
        'border-gray-500': order.status === 'Отправлен',
      }"
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
              v-model="order.status"
              class="px-3 py-2 rounded-md border w-full md:w-48"
              :class="{
                'bg-blue-100 border-blue-300 text-blue-800':
                  order.status === 'Новый заказ',
                'bg-yellow-100 border-yellow-300 text-yellow-800':
                  order.status === 'В работе',
                'bg-green-100 border-green-300 text-green-800':
                  order.status === 'Оплачен',
                'bg-gray-100 border-gray-300 text-gray-800':
                  order.status === 'Отправлен',
              }"
            >
              <option value="Новый заказ">Новый заказ</option>
              <option value="В работе">В работе</option>
              <option value="Оплачен">Оплачен</option>
              <option value="Отправлен">Отправлен</option>
            </select>
            <UButton
              color="primary"
              variant="solid"
              class="w-full md:w-auto"
              @click="updateStatus(order.id, order.status)"
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
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useFirebase } from '~/composables/firebase/useFirebase'

  const { allOrders } = storeToRefs(useOrdersStore())
  const { updateOrderStatus } = useFirebase()
  const selectedStatus = ref('all')

  const filteredOrders = computed(() => {
    if (!allOrders.value) return []
    if (selectedStatus.value === 'all') return allOrders.value
    return allOrders.value.filter(
      order => order.status === selectedStatus.value,
    )
  })

  function updateStatus(id: number, status: string) {
    updateOrderStatus(id, status)
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

# Payment Success and Order Tracking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Создать страницу успешной оплаты и страницу отслеживания заказа с сохранением ID платежа в Firebase

**Architecture:** Webhook сохраняет paymentId в заказе, фронтенд запрашивает заказы по paymentId для отображения деталей и поиска

**Tech Stack:** Nuxt 3, Firebase Realtime Database, Yandex Cloud Functions, Yookassa API

---

### Task 1: Создать страницу успешной оплаты PaymentSuccess.vue

**Files:**
- Create: `pages/shop/payment-success.vue`

**Step 1: Создать базовую структуру страницы**

```vue
<template>
  <div class="payment-success-page">
    <AnimatedBlob>
      <template #icon>
        <svg class="w-[80px] h-[80px]" viewBox="0 0 52 52">
          <path d="M14 27l7 7 17-17" fill="none" stroke="white" stroke-width="5" />
        </svg>
      </template>
      <template #heading>
        Оплата прошла успешно!
      </template>
      <template #description>
        Спасибо за покупку! Ваш заказ успешно оплачен
      </template>
    </AnimatedBlob>

    <!-- Детали заказа -->
    <div v-if="order" class="order-details">
      <h2>Детали заказа</h2>
      <div class="detail-item">
        <span>Товар:</span>
        <span>{{ productName }}</span>
      </div>
      <div class="detail-item">
        <span>Цена:</span>
        <span>{{ orderPrice }} ₽</span>
      </div>
      <div class="detail-item">
        <span>Способ доставки:</span>
        <span>{{ deliveryMethod }}</span>
      </div>
      <div class="detail-item">
        <span>Дата оплаты:</span>
        <span>{{ paymentDate }}</span>
      </div>
    </div>

    <!-- Номер для отслеживания -->
    <div v-if="order" class="tracking-number">
      <h3>Номер для отслеживания</h3>
      <div class="payment-id">{{ paymentId }}</div>
      <p class="warning">Сохраните этот номер для отслеживания заказа</p>
    </div>

    <!-- Следующие шаги -->
    <div class="next-steps">
      <h3>Следующие шаги</h3>
      <ul>
        <li>Скоро с вами свяжется продавец для уточнения деталей доставки</li>
        <li>Статус заказа можно отслеживать на "Странице отслеживания заказа"</li>
        <li>При возникновении вопросов с вами свяжутся через указанный контакт</li>
      </ul>
      <div class="actions">
        <NuxtLink to="/shop" class="btn-primary">
          Вернуться в магазин
        </NuxtLink>
        <NuxtLink to="/shop/tracking" class="btn-secondary">
          Страница отслеживания заказа
        </NuxtLink>
      </div>
    </div>

    <!-- Контакт для связи -->
    <div class="contact-info">
      <h3>Контакты для связи</h3>
      <div class="contact-item">
        <a href="https://t.me/kalashyulyaa" target="_blank" rel="noopener">
          Telegram: @kalashyulyaa
        </a>
      </div>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="loading">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
      <p>Загрузка информации о заказе...</p>
    </div>

    <!-- Ошибка -->
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <NuxtLink to="/shop" class="btn-primary">
        Вернуться в магазин
      </NuxtLink>
    </div>
  </div>
</template>
```

**Step 2: Добавить логику получения данных заказа**

```vue
<script setup lang="ts">
const route = useRoute()
const loading = ref(true)
const error = ref<string | null>(null)
const order = ref<any>(null)
const paymentId = route.query.paymentId as string

onMounted(async () => {
  await fetchOrder()
})

const fetchOrder = async () => {
  try {
    loading.value = true

    if (!paymentId) {
      error.value = 'Не передан ID платежа. Перейдите по ссылке из письма или свяжитесь с поддержкой.'
      return
    }

    // Ищем заказ по paymentId
    const ordersRef = db.ref('orders')
    const snapshot = await ordersRef.orderByChild('paymentId').equalTo(paymentId).once('value')
    const orders = snapshot.val()

    if (!orders) {
      error.value = 'Заказ не найден. Проверьте ID платежа или свяжитесь с поддержкой.'
      return
    }

    const orderKey = Object.keys(orders)[0]
    order.value = orders[orderKey]

    // Форматируем данные
    const productName = order.value.purchase.order?.[0]?.title || 'Товар'
    const orderPrice = order.value.totalPrice || 0
    const deliveryMethod = order.value.customer.delivery?.street ? 'Доставка' : 'Самовывоз'
    const paymentDate = new Date(order.value.purchase.createdAt).toLocaleString('ru-RU')

  } catch (err) {
    console.error('Error fetching order:', err)
    error.value = 'Не удалось загрузить данные заказа. Попробуйте позже.'
  } finally {
    loading.value = false
  }
}
</script>
```

**Step 3: Добавить стили**

```vue
<style scoped lang="scss">
.payment-success-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
}

.dark .payment-success-page {
  background: linear-gradient(to bottom, #171717, #262626);
}

.order-details {
  background: white;
  dark: dark: #262626;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 2rem auto;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tracking-number {
  background: white;
  dark: dark: #262626;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 2rem auto;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.payment-id {
  font-size: 1.5rem;
  font-weight: bold;
  color: #10b981;
  padding: 0.5rem 0;
  word-break: break-all;
}

.warning {
  color: #f59e0b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.next-steps, .contact-info {
  background: white;
  dark: dark: #262626;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 2rem auto;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
  dark: #9ca3af;

  span:first-child {
    font-weight: 500;
  }

  span:last-child {
    color: #111827;
    dark: #e5e7eb;
  }
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  color: #991b1b;
}
</style>
```

**Step 4: Запустить тест**

```bash
npm run dev
```

Перейти по URL: `http://localhost:3000/shop/payment-success?paymentId=314c92fb-000f-5000-b000-1c4140d12338`

**Step 5: Закоммитить**

```bash
git add pages/shop/payment-success.vue
git commit -m "feat: add payment success page with order details"
```

---

### Task 2: Создать страницу отслеживания заказа OrderTracking.vue

**Files:**
- Create: `pages/shop/tracking.vue`

**Step 1: Создать базовую структуру страницы**

```vue
<template>
  <div class="tracking-page">
    <div class="container">
      <h1>Отслеживание заказа</h1>

      <!-- Форма поиска -->
      <div class="search-form">
        <label for="paymentId">Введите ID платежа</label>
        <input
          id="paymentId"
          v-model="searchPaymentId"
          type="text"
          placeholder="Например: 314c92fb-000f-5000-b000-1c4140d12338"
          @keyup.enter="searchOrder"
        />
        <button @click="searchOrder" :disabled="loading || !searchPaymentId.trim()">
          Найти заказ
        </button>
      </div>

      <!-- Результат поиска -->
      <div v-if="order" class="order-card">
        <h2>Заказ найден</h2>

        <!-- Детали заказа -->
        <div class="details">
          <div class="detail-row">
            <span>Номер заказа:</span>
            <span>{{ order.id }}</span>
          </div>
          <div class="detail-row">
            <span>Товар:</span>
            <span>{{ order.purchase.order?.[0]?.title }}</span>
          </div>
          <div class="detail-row">
            <span>Цена:</span>
            <span>{{ order.totalPrice }} ₽</span>
          </div>
          <div class="detail-row">
            <span>Статус:</span>
            <span :class="getStatusClass(order.status)">{{ order.status }}</span>
          </div>
          <div class="detail-row">
            <span>Дата заказа:</span>
            <span>{{ formatOrderDate(order.purchase.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <span>Способ доставки:</span>
            <span>{{ getDeliveryMethod(order.customer.delivery) }}</span>
          </div>
        </div>

        <!-- Информация о клиенте -->
        <div class="customer-info">
          <h3>Информация о клиенте</h3>
          <div class="info-row">
            <span>Имя:</span>
            <span>{{ order.customer.name }}</span>
          </div>
          <div class="info-row">
            <span>Email:</span>
            <span>{{ order.customer.email }}</span>
          </div>
          <div class="info-row">
            <span>Телефон:</span>
            <span>{{ order.customer.phone || 'Не указан' }}</span>
          </div>
          <div class="info-row">
            <span>Способ связи:</span>
            <span>{{ order.customer.userMessenger || 'Не указан' }}</span>
          </div>
        </div>
      </div>

      <!-- Сообщения об ошибке -->
      <div v-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="resetSearch" class="btn-secondary">
          Попробовать снова
        </button>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="loading">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
        <p>Поиск заказа...</p>
      </div>
    </div>
  </div>
</template>
```

**Step 2: Добавить логику поиска заказа**

```vue
<script setup lang="ts">
const searchPaymentId = ref('')
const loading = ref(false)
const order = ref<any>(null)
const error = ref<string | null>(null)

const searchOrder = async () => {
  if (!searchPaymentId.value.trim()) {
    error.value = 'Введите ID платежа для поиска заказа.'
    return
  }

  try {
    loading.value = true
    error.value = null
    order.value = null

    // Ищем заказ по paymentId
    const ordersRef = db.ref('orders')
    const snapshot = await ordersRef.orderByChild('paymentId').equalTo(searchPaymentId.value.trim()).once('value')
    const orders = snapshot.val()

    if (!orders) {
      error.value = 'Заказ с таким ID не найден. Проверьте введенный ID или свяжитесь с поддержкой.'
      return
    }

    const orderKey = Object.keys(orders)[0]
    order.value = orders[orderKey]

  } catch (err) {
    console.error('Error searching order:', err)
    error.value = 'Не удалось выполнить поиск. Попробуйте позже.'
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchPaymentId.value = ''
  order.value = null
  error.value = null
}

const formatOrderDate = (date: string) => {
  return new Date(date).toLocaleString('ru-RU')
}

const getDeliveryMethod = (delivery: any) => {
  if (delivery?.street || delivery?.city) {
    return 'Доставка'
  }
  return 'Самовывоз'
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Оплачен':
      return 'status-paid'
    case 'В обработке':
      return 'status-processing'
    case 'Отменен':
      return 'status-canceled'
    case 'Новый заказ':
      return 'status-new'
    default:
      return ''
  }
}
</script>
```

**Step 3: Добавить стили**

```vue
<style scoped lang="scss">
.tracking-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  padding: 2rem 1rem;
}

.dark .tracking-page {
  background: linear-gradient(to bottom, #171717, #262626);
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  color: #111827;
  dark: #e5e7eb;
}

.search-form {
  background: white;
  dark: dark: #262626;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

label {
  display: block;
  text-align: left;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  dark: #e5e7eb;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
}

button {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #059669;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.order-card {
  background: white;
  dark: dark: #262626;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.details, .customer-info {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
  dark: #e5e7eb;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
  dark: #e5e7eb;
}

.detail-row, .info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;

  span:first-child {
    font-weight: 500;
    color: #6b7280;
  }

  span:last-child {
    color: #111827;
    dark: #e5e7eb;
  }
}

.status-paid {
  color: #10b981;
  font-weight: 600;
}

.status-processing {
  color: #f59e0b;
  font-weight: 600;
}

.status-canceled {
  color: #ef4444;
  font-weight: 600;
}

.status-new {
  color: #6b7280;
  font-weight: 600;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;

  &:hover {
    background: #4b5563;
  }
}
</style>
```

**Step 4: Запустить тест**

```bash
npm run dev
```

Перейти по URL: `http://localhost:3000/shop/tracking`

**Step 5: Закоммитить**

```bash
git add pages/shop/tracking.vue
git commit -m "feat: add order tracking page"
```

---

### Task 3: Добавить ссылку на отслеживание в футер

**Files:**
- Modify: `components/app/footer/Links.vue`

**Step 1: Добавить ссылку после "Реквизиты"**

```vue
<!-- После строки 92, добавить новую ссылку -->

<!-- Order Tracking Link -->
<NuxtLink
  to="/shop/tracking"
  class="group flex items-center justify-center space-x-3 p-3 rounded-lg
    hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors
    duration-200 sm:ml-2"
  @click="metrics.trackButtonClick('trackingButton')"
>
  <div class="flex flex-col text-center sm:text-left">
    <span
      class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
    >
      Отслеживание заказа
    </span>
    <span class="text-xs text-neutral-500 dark:text-neutral-400">
      Найти заказ по ID платежа
    </span>
  </div>
</NuxtLink>
```

**Step 2: Запустить тест**

```bash
npm run dev
```

Проверить что ссылка отображается в футере и работает.

**Step 3: Закоммитить**

```bash
git add components/app/footer/Links.vue
git commit -m "feat: add order tracking link to footer"
```

---

### Task 4: Обновить страницу success.vue

**Files:**
- Modify: `pages/shop/success.vue`

**Step 1: Заменить компонент SuccessOrder на логику редиректа**

```vue
<template>
  <div class="success-redirect-page">
    <div class="container">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin w-12 h-12" />
      <p>Перенаправление на страницу успешной оплаты...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Проверяем есть ли paymentId в query
const paymentId = route.query.paymentId as string

// Если есть paymentId, редиректим на payment-success
if (paymentId) {
  router.push({
    path: '/shop/payment-success',
    query: { paymentId }
  })
} else {
  // Если нет paymentId, можно редиректить на магазин
  router.push('/shop')
}
</script>

<style scoped lang="scss">
.success-redirect-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
}

.dark .success-redirect-page {
  background: linear-gradient(to bottom, #171717, #262626);
}

.container {
  text-align: center;
  color: #6b7280;
}
</style>
```

**Step 2: Запустить тест**

```bash
npm run dev
```

Перейти по URL: `http://localhost:3000/shop/success?paymentId=314c92fb-000f-5000-b000-1c4140d12338`

**Step 3: Закоммитить**

```bash
git add pages/shop/success.vue
git commit -m "feat: redirect success page to payment-success with paymentId"
```

---

## Тестирование после реализации

### Функциональные проверки
1. Успешная оплата → редирект на `/shop/payment-success?paymentId=...` → детали заказа отображаются
2. Ввод правильного ID платежа на `/shop/tracking` → заказ найден и отображается
3. Ввод неверного ID платежа → сообщение об ошибке
4. Пустой ввод ID платежа → валидация срабатывает
5. Ссылка в футере → открывает `/shop/tracking`

### UX проверки
1. AnimatedBlob загружается на странице оплаты
2. Кнопки навигируют правильно
3. Форма валидируется при пустом вводе
4. Сообщения об ошибках понятны на русском
5. Адаптивность на мобильных устройствах

### Интеграционные проверки
1. Firebase query по `paymentId` работает корректно
2. Webhook сохраняет `paymentId` в заказы
3. Редирект с ЮKassa передает правильный `paymentId`

## Итог

После выполнения всех задач:
- ✅ Пользователь видит страницу успешной оплаты с деталями заказа
- ✅ Пользователь может искать заказы по ID платежа
- ✅ Ссылка на отслеживание доступна в футере
- ✅ ID платежа сохраняется в Firebase и используется для отслеживания
- ✅ Красивый и удобный интерфейс на русском языке

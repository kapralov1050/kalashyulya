# Implementer Subagent - Task 4: Обновить страницу success.vue с редиректом

## Задача
Обновить страницу `/shop/success` чтобы она редиректила на `/shop/payment-success` с paymentId из query параметров.

## Технологии
- Nuxt 3
- Vue 3
- TypeScript
- Nuxt Router

## Требования к реализации

### Функциональные требования
1. Получить `paymentId` из route query параметров (`route.query.paymentId`)
2. Если `paymentId` присутствует, редиректить на `/shop/payment-success` с передачей `paymentId` в query
3. Если `paymentId` отсутствует, редиректить на `/shop`
4. Использовать `router.push` для навигации

### UI/UX требования
1. Показать спиннер загрузки во время редиректа
2. Сообщение "Перенаправление на страницу успешной оплаты..."
3. Градиентный фон для страницы
4. Адаптивность для мобильных устройств
5. Темная тема (dark mode)

### Технические требования
1. Заменить компонент `SuccessOrder` на простое редиректовое поведение
2. Использовать Nuxt composables: `useRoute` и `useRouter`
3. Удалить ненужные импорты и компоненты
4. Добавить логику редиректа в `onMounted`
5. Правильная типизация TypeScript

## Дополнительный контекст

### Текущая структура
Файл: `pages/shop/success.vue` в данный момент содержит компонент `SuccessOrder`.

### Почему нужен редирект
- ЮKassa редиректит на `/shop/success?paymentId=...`
- Нужно перенаправить на `/shop/payment-success?paymentId=...`
- Это позволит сохранить в истории браузера правильный URL

## Тестирование

1. Перейти по URL: `http://localhost:3000/shop/success?paymentId=test_payment_id`
2. Убедиться что происходит редирект на `/shop/payment-success?paymentId=test_payment_id`
3. Перейти по URL: `http://localhost:3000/shop/success` (без paymentId)
4. Убедиться что происходит редирект на `/shop`

## Коммит

```bash
git add pages/shop/success.vue
git commit -m "feat: redirect success page to payment-success with paymentId"
```

Начни реализацию! После завершения сообщи что готово.
# Design: Payment Success and Order Tracking

## Overview
Create payment success page and order tracking functionality for Yookassa payments with Firebase backend.

## Architecture

### Components
- `PaymentSuccess.vue` - `/shop/payment-success` page
- `OrderTracking.vue` - `/shop/tracking` page
- Updated `Links.vue` - footer link to tracking
- Updated `process-payment/index.js` - save paymentId to orders

### Data Flow
1. Webhook → Firebase (saves `paymentId`)
2. Yookassa redirect → `/shop/payment-success?paymentId=...`
3. Payment Success → Firebase (fetch order by `paymentId`)
4. Tracking page → Firebase (search order by `paymentId`)

### Tech Stack
- Firebase Realtime Database for order storage
- Yandex Cloud Functions for webhook processing
- Nuxt 3 for frontend pages
- AnimatedBlob component for success state

## Payment Success Page

### URL: `/shop/payment-success`

### Query Parameters
- `paymentId` (required) - Yookassa payment ID

### Content
1. **Success State** - AnimatedBlob with checkmark
2. **Confirmation Message** - "Оплата прошла успешно!"
3. **Order Details**:
   - Product name
   - Price
   - Delivery address
   - Delivery method
   - Payment date
4. **Tracking Number**:
   - Payment ID (prominent display)
   - Warning: "Сохраните этот номер для отслеживания"
5. **Next Steps**:
   - Return to shop button
   - Link to tracking page
6. **Contact Information**:
   - Telegram username
   - Email (optional)

### Error Handling
- Order not found: "Заказ не найден. Проверьте ID платежа или свяжитесь с поддержкой."
- Firebase error: "Не удалось загрузить данные заказа. Попробуйте позже."
- Missing paymentId: "Не передан ID платежа. Перейдите по ссылке из письма или свяжитесь с поддержкой."

## Order Tracking Page

### URL: `/shop/tracking`

### Search Input
- Text input for payment ID
- "Найти заказ" button
- Validation: required field

### Order Card (when found)
- Product details
- Price
- Status
- Payment date
- Delivery information

### Error States
- Empty input: "Введите ID платежа для поиска заказа."
- Order not found: "Заказ с таким ID не найден. Проверьте введенный ID или свяжитесь с поддержкой."
- Firebase error: "Не удалось выполнить поиск. Попробуйте позже."

## Firebase Data Structure

### Order Object
```javascript
{
  "id": 4,
  "status": "Оплачен",
  "paymentId": "314c92fb-000f-5000-b000-1c4140d12338",
  "customer": { ... },
  "purchase": { ... },
  "totalPrice": 5000
}
```

### Query Pattern
```javascript
db.ref('orders').orderByChild('paymentId').equalTo(paymentId).once('value')
```

## Webhook Updates

### process-payment function changes
- Add `paymentId: payment.id` to order updates
- Save in all status handlers (succeeded, canceled, waiting_for_capture)
- Keep existing status updates

## Footer Update

### Links.vue
- Add new link next to "Реквизиты"
- Link text: "Отслеживание заказа"
- Link URL: `/shop/tracking`
- Icon: search/document icon

## Implementation Priority
1. High: Webhook paymentId saving (already done by user)
2. High: PaymentSuccess page creation
3. High: OrderTracking page creation
4. Medium: Footer link addition

## Considerations
- Payment ID is unique and secure enough for public access
- Russian language throughout the interface
- Mobile responsive design
- Loading states for async operations
- User-friendly error messages

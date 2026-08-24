import type { OrderInBase } from '~/types'
import type { YookassaPaymentStatus } from './useYookassaPayment'

/**
 * Стейт-машина для страницы /shop/payment-success (payment-result.vue).
 *
 * Принципы:
 * - Невозможно оказаться в невалидном state (например, `loading=false && error=null && paymentStatus='succeeded'`).
 * - Каждый transition явный через reducer-функцию ниже.
 * - Один источник истины: компонент читает только `state.kind` и соответствующие поля.
 *
 * `order` допускает null для succeeded/pending/canceled/switchedToManual, чтобы
 * сохранить поведение оригинальной страницы: если orders.loadOrders() не
 * успел / не нашёл заказ — статус всё равно показывается, а блок деталей
 * скрывается через `v-if="currentOrder"`.
 */
export type PaymentResultState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'succeeded'; order: OrderInBase | null; paymentId: string }
  | {
      kind: 'pending'
      order: OrderInBase | null
      paymentId: string
      timedOut: boolean
    }
  | { kind: 'canceled'; order: OrderInBase | null; paymentId: string }
  | { kind: 'notFound'; paymentId: string }
  | { kind: 'switchedToManual'; order: OrderInBase | null }

export type PaymentResultStateKind = PaymentResultState['kind']

const KEEP_FIRST_MESSAGE_KINDS: ReadonlySet<PaymentResultStateKind> = new Set([
  'error',
  'succeeded',
  'canceled',
  'notFound',
  'switchedToManual',
])

export function initialState(): PaymentResultState {
  return { kind: 'loading' }
}

/**
 * Перейти в error. Сохраняет первое сообщение, если state уже в финальной
 * форме (error/succeeded/canceled/notFound/switchedToManual) — чтобы
 * сетевой сбой не затирал успешное/терминальное состояние.
 * Из pending переходит в error (polling завершился неудачно).
 */
export function setError(
  state: PaymentResultState,
  message: string,
): PaymentResultState {
  if (KEEP_FIRST_MESSAGE_KINDS.has(state.kind)) {
    return state
  }
  return { kind: 'error', message }
}

/**
 * Применить статус от ЮKassa (или внутренний сигнал).
 * - succeeded + order → succeeded; без order → notFound.
 * - pending / waiting_for_capture → pending { timedOut: false } (сбрасывает таймаут).
 * - canceled + order → canceled; без order → notFound.
 * - not_found → notFound.
 */
export function setStatus(
  _state: PaymentResultState,
  status: YookassaPaymentStatus,
  order: OrderInBase | null,
  paymentId: string,
): PaymentResultState {
  switch (status) {
    case 'succeeded':
      return order
        ? { kind: 'succeeded', order, paymentId }
        : { kind: 'notFound', paymentId }
    case 'pending':
    case 'waiting_for_capture':
      return { kind: 'pending', order, paymentId, timedOut: false }
    case 'canceled':
      return order
        ? { kind: 'canceled', order, paymentId }
        : { kind: 'notFound', paymentId }
    case 'not_found':
      return { kind: 'notFound', paymentId }
  }
}

/**
 * Перевести pending в pending.timedOut=true после превышения лимита polling.
 * Из других state — no-op (защита от race после polling-stop).
 */
export function setPollingTimedOut(
  state: PaymentResultState,
): PaymentResultState {
  if (state.kind !== 'pending') return state
  return { ...state, timedOut: true }
}

/**
 * Безусловный переход в switchedToManual после успешного PATCH /payment-method.
 */
export function setSwitchedToManual(
  _state: PaymentResultState,
  order: OrderInBase | null,
): PaymentResultState {
  return { kind: 'switchedToManual', order }
}

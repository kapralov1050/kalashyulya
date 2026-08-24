import { describe, expect, it } from 'vitest'
import type { OrderInBase } from '~/types'
import type { PaymentResultState } from '../usePaymentResultState'
import {
  initialState,
  setError,
  setPollingTimedOut,
  setStatus,
  setSwitchedToManual,
} from '../usePaymentResultState'

function makeOrder(): OrderInBase {
  return {
    id: 1,
    status: 'Новый заказ',
    paymentId: 'pay-1',
    customer: {
      name: 'Иван',
      email: 'i@x.com',
      phone: '+7',
      userMessenger: 'tg',
      userNickname: '@i',
      delivery: { type: 'pickup' },
    },
    purchase: { order: [], createdAt: '2026-01-01T00:00:00.000Z' },
    totalPrice: 100,
    paymentMethod: 'yookassa',
  }
}

describe('usePaymentResultState', () => {
  describe('initialState', () => {
    it('возвращает loading', () => {
      expect(initialState()).toEqual({ kind: 'loading' })
    })
  })

  describe('setError', () => {
    it('loading → error', () => {
      expect(setError({ kind: 'loading' }, 'boom')).toEqual({
        kind: 'error',
        message: 'boom',
      })
    })

    it('pending → error', () => {
      const s = {
        kind: 'pending' as const,
        order: null,
        paymentId: 'p',
        timedOut: false,
      }
      expect(setError(s, 'net err')).toEqual({
        kind: 'error',
        message: 'net err',
      })
    })

    it('error → сохраняет первое сообщение', () => {
      const s: PaymentResultState = { kind: 'error', message: 'first' }
      const next = setError(s, 'second')
      expect(next).toBe(s)
      expect(
        (next as Extract<PaymentResultState, { kind: 'error' }>).message,
      ).toBe('first')
    })

    it('succeeded/canceled/notFound/switchedToManual → no-op', () => {
      const order = makeOrder()
      const states: PaymentResultState[] = [
        { kind: 'succeeded', order, paymentId: 'p' },
        { kind: 'canceled', order, paymentId: 'p' },
        { kind: 'notFound', paymentId: 'p' },
        { kind: 'switchedToManual', order },
      ]
      for (const s of states) {
        expect(setError(s, 'late-error')).toBe(s)
      }
    })
  })

  describe('setStatus', () => {
    const order = makeOrder()

    it('succeeded + order → succeeded', () => {
      expect(setStatus(initialState(), 'succeeded', order, 'p')).toEqual({
        kind: 'succeeded',
        order,
        paymentId: 'p',
      })
    })

    it('succeeded + null order → notFound', () => {
      expect(setStatus(initialState(), 'succeeded', null, 'p')).toEqual({
        kind: 'notFound',
        paymentId: 'p',
      })
    })

    it('pending → pending { timedOut: false } (сбрасывает таймаут)', () => {
      const prev: PaymentResultState = {
        kind: 'pending',
        order: null,
        paymentId: 'p',
        timedOut: true,
      }
      expect(setStatus(prev, 'pending', order, 'p')).toEqual({
        kind: 'pending',
        order,
        paymentId: 'p',
        timedOut: false,
      })
    })

    it('waiting_for_capture → pending { timedOut: false }', () => {
      expect(
        setStatus(initialState(), 'waiting_for_capture', order, 'p'),
      ).toEqual({
        kind: 'pending',
        order,
        paymentId: 'p',
        timedOut: false,
      })
    })

    it('canceled + order → canceled', () => {
      expect(setStatus(initialState(), 'canceled', order, 'p')).toEqual({
        kind: 'canceled',
        order,
        paymentId: 'p',
      })
    })

    it('canceled + null order → notFound', () => {
      expect(setStatus(initialState(), 'canceled', null, 'p')).toEqual({
        kind: 'notFound',
        paymentId: 'p',
      })
    })

    it('not_found → notFound', () => {
      expect(setStatus(initialState(), 'not_found', order, 'p')).toEqual({
        kind: 'notFound',
        paymentId: 'p',
      })
    })
  })

  describe('setPollingTimedOut', () => {
    it('pending → pending { timedOut: true }', () => {
      const s: PaymentResultState = {
        kind: 'pending',
        order: null,
        paymentId: 'p',
        timedOut: false,
      }
      expect(setPollingTimedOut(s)).toEqual({
        kind: 'pending',
        order: null,
        paymentId: 'p',
        timedOut: true,
      })
    })

    it('non-pending → no-op', () => {
      const order = makeOrder()
      const states: PaymentResultState[] = [
        { kind: 'loading' },
        { kind: 'error', message: 'x' },
        { kind: 'succeeded', order, paymentId: 'p' },
        { kind: 'canceled', order, paymentId: 'p' },
        { kind: 'notFound', paymentId: 'p' },
        { kind: 'switchedToManual', order },
      ]
      for (const s of states) {
        expect(setPollingTimedOut(s)).toBe(s)
      }
    })
  })

  describe('setSwitchedToManual', () => {
    it('безусловный переход в switchedToManual', () => {
      const order = makeOrder()
      const states: PaymentResultState[] = [
        { kind: 'loading' },
        { kind: 'pending', order: null, paymentId: 'p', timedOut: false },
        { kind: 'error', message: 'x' },
      ]
      for (const s of states) {
        expect(setSwitchedToManual(s, order)).toEqual({
          kind: 'switchedToManual',
          order,
        })
      }
    })
  })
})

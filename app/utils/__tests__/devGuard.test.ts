import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { isDevOrPreview } from '../devGuard'

describe('isDevOrPreview', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function mockLocation({ hostname, href }: { hostname: string, href: string }) {
    vi.stubGlobal('window', {
      location: { hostname, href },
    })
  }

  it('на kalashyulya.ru (prod) — false', () => {
    mockLocation({ hostname: 'kalashyulya.ru', href: 'https://kalashyulya.ru/' })
    expect(isDevOrPreview()).toBe(false)
  })

  it('на www — false', () => {
    mockLocation({ hostname: 'www.kalashyulya.ru', href: 'https://www.kalashyulya.ru/' })
    expect(isDevOrPreview()).toBe(false)
  })

  it('на localhost — true', () => {
    mockLocation({ hostname: 'localhost', href: 'http://localhost:3000/' })
    expect(isDevOrPreview()).toBe(true)
  })

  it('на 127.0.0.1 — true', () => {
    mockLocation({ hostname: '127.0.0.1', href: 'http://127.0.0.1:3000/' })
    expect(isDevOrPreview()).toBe(true)
  })

  it('на 127.0.0.1:3002 (Docker dev) — true', () => {
    mockLocation({ hostname: '127.0.0.1', href: 'http://127.0.0.1:3002/' })
    expect(isDevOrPreview()).toBe(true)
  })

  it('на kalashyulya.vercel.app — true', () => {
    mockLocation({ hostname: 'kalashyulya.vercel.app', href: 'https://kalashyulya.vercel.app/' })
    expect(isDevOrPreview()).toBe(true)
  })

  it('SSR (window undefined) — false', () => {
    delete (globalThis as Record<string, unknown>).window
    expect(isDevOrPreview()).toBe(false)
  })
})
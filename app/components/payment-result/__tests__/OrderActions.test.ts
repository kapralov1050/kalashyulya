import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import OrderActions from '../OrderActions.vue'

const stubs = {
  UButton: {
    emits: ['click'],
    props: ['color', 'variant', 'size', 'loading', 'disabled', 'block'],
    template:
      '<button :data-color="color" :data-variant="variant" :data-loading="loading" :data-disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  },
  UIcon: {
    props: ['name'],
    template: '<span :data-icon="name" />',
  },
}

describe('OrderActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('рендерит количество кнопок равное actions.length', () => {
    const wrapper = mount(OrderActions, {
      props: {
        actions: [
          { label: 'Действие 1', onClick: vi.fn() },
          { label: 'Действие 2', onClick: vi.fn() },
          { label: 'Действие 3', onClick: vi.fn() },
        ],
      },
      global: { stubs },
    })
    expect(wrapper.findAll('button')).toHaveLength(3)
    expect(wrapper.text()).toContain('Действие 1')
    expect(wrapper.text()).toContain('Действие 2')
    expect(wrapper.text()).toContain('Действие 3')
  })

  it('вызывает onClick конкретной кнопки', async () => {
    const onClick1 = vi.fn()
    const onClick2 = vi.fn()
    const wrapper = mount(OrderActions, {
      props: {
        actions: [
          { label: 'Первая', onClick: onClick1 },
          { label: 'Вторая', onClick: onClick2 },
        ],
      },
      global: { stubs },
    })

    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')

    expect(onClick1).toHaveBeenCalledTimes(1)
    expect(onClick2).toHaveBeenCalledTimes(1)
  })

  it('пробрасывает loading и disabled на UButton', () => {
    const wrapper = mount(OrderActions, {
      props: {
        actions: [
          {
            label: 'A',
            onClick: vi.fn(),
            loading: true,
            disabled: true,
          },
          { label: 'B', onClick: vi.fn() },
        ],
      },
      global: { stubs },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.attributes('data-loading')).toBe('true')
    expect(buttons[0]!.attributes('data-disabled')).toBe('true')
    expect(buttons[1]!.attributes('data-loading')).toBeUndefined()
    expect(buttons[1]!.attributes('data-disabled')).toBeUndefined()
  })

  it('пробрасывает color и variant на UButton', () => {
    const wrapper = mount(OrderActions, {
      props: {
        actions: [
          {
            label: 'Primary',
            onClick: vi.fn(),
            color: 'primary',
            variant: 'solid',
          },
          {
            label: 'Neutral outline',
            onClick: vi.fn(),
            color: 'neutral',
            variant: 'outline',
          },
        ],
      },
      global: { stubs },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.attributes('data-color')).toBe('primary')
    expect(buttons[0]!.attributes('data-variant')).toBe('solid')
    expect(buttons[1]!.attributes('data-color')).toBe('neutral')
    expect(buttons[1]!.attributes('data-variant')).toBe('outline')
  })

  it('рендерит иконку если action.icon передан', () => {
    const wrapper = mount(OrderActions, {
      props: {
        actions: [
          {
            label: 'С иконкой',
            onClick: vi.fn(),
            icon: 'i-heroicons-check',
          },
        ],
      },
      global: { stubs },
    })
    expect(wrapper.find('[data-icon="i-heroicons-check"]').exists()).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ConsentCheckbox from '../ConsentCheckbox.vue'

const stubs = {
  UCheckbox: {
    props: ['modelValue', 'required'],
    emits: ['update:modelValue'],
    template: `<input
      type="checkbox"
      :checked="modelValue"
      :required="required"
      @change="$emit('update:modelValue', $event.target.checked)"
    >`,
  },
  NuxtLink: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  },
}

function mountCheckbox(props: { modelValue: boolean; required?: boolean }) {
  return mount(ConsentCheckbox, {
    props,
    global: { stubs },
  })
}

describe('ConsentCheckbox', () => {
  describe('v-model', () => {
    it('updates modelValue when clicked', async () => {
      const wrapper = mountCheckbox({ modelValue: false })

      await wrapper.find('input[type="checkbox"]').setValue(true)

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })
  })

  describe('privacy link', () => {
    it('renders a link to the privacy policy', () => {
      const wrapper = mountCheckbox({ modelValue: false })
      const link = wrapper.find('a[href="/privacy"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toContain('Политикой обработки персональных данных')
    })
  })

  describe('required', () => {
    it('marks the checkbox as required by default', () => {
      const wrapper = mountCheckbox({ modelValue: false })

      expect(wrapper.find('input[type="checkbox"]').attributes()).toHaveProperty(
        'required',
      )
    })
  })
})

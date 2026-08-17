<template>
  <div class="space-y-5">
    <UFormField label="Имя" :error="errors.name">
      <UInput
        v-model="form.name"
        size="xl"
        placeholder="Иван Иванов"
        class="w-full"
        @blur="touchField('name')"
      />
    </UFormField>

    <UFormField label="Email" :error="errors.email">
      <UInput
        v-model="form.email"
        size="xl"
        type="email"
        placeholder="ivan@mail.ru"
        class="w-full"
        @blur="touchField('email')"
      />
    </UFormField>

    <div class="space-y-2">
      <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Способ связи</label>
      <div class="flex gap-2">
        <button
          v-for="m in MESSENGER_OPTIONS"
          :key="m.value"
          class="flex-1 py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all"
          :class="form.messengers.includes(m.value)
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
            : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400'"
          @click="toggleMessenger(m.value)"
        >
          {{ m.label }}
        </button>
      </div>
      <p v-if="errors.messengers" class="text-sm text-error">{{ errors.messengers }}</p>
    </div>

    <Transition name="slide-up">
      <UFormField
        v-if="form.messengers.includes('phone')"
        label="Телефон"
        required
        :error="errors.phone"
      >
        <UInput
          v-model="form.phone"
          size="xl"
          placeholder="+79999999999"
          class="w-full"
          @blur="touchField('phone')"
        />
      </UFormField>
    </Transition>

    <Transition name="slide-up">
      <UFormField
        v-if="form.messengers.some(m => ['vk', 'tg'].includes(m))"
        label="Никнейм"
        required
        :error="errors.nickname"
      >
        <UInput
          v-model="form.nickname"
          size="xl"
          placeholder="@username"
          class="w-full"
          @blur="touchField('nickname')"
        />
      </UFormField>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useCheckoutStore } from '../../store'
import { useCheckout } from '../../useCheckout'

defineProps<{
  errors: Record<string, string>
}>()

const MESSENGER_OPTIONS = [
  { value: 'vk', label: 'ВКонтакте' },
  { value: 'tg', label: 'Телеграм' },
  { value: 'phone', label: 'Звонок' },
]

const { form } = useCheckoutStore()
const { touchField } = useCheckout()

function toggleMessenger(value: string) {
  const idx = form.messengers.indexOf(value)
  if (idx === -1) form.messengers.push(value)
  else form.messengers.splice(idx, 1)
  touchField('messengers')
}
</script>

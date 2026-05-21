<template>
  <div class="space-y-5">
    <div class="space-y-1.5">
      <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Имя</label>
      <UInput v-model="form.name" size="xl" placeholder="Иван Иванов" class="w-full" />
    </div>

    <div class="space-y-1.5">
      <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Email</label>
      <UInput v-model="form.email" size="xl" type="email" placeholder="ivan@mail.ru" class="w-full" />
    </div>

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
    </div>

    <Transition name="slide-up">
      <div v-if="form.messengers.includes('phone')" class="space-y-1.5">
        <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Телефон</label>
        <UInput v-model="form.phone" size="xl" placeholder="+7 999 999-99-99" class="w-full" />
      </div>
    </Transition>

    <Transition name="slide-up">
      <div v-if="form.messengers.some(m => ['vk', 'tg'].includes(m))" class="space-y-1.5">
        <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Никнейм</label>
        <UInput v-model="form.nickname" size="xl" placeholder="@username" class="w-full" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useCheckoutStore } from '../../store'

const MESSENGER_OPTIONS = [
  { value: 'vk', label: 'ВКонтакте' },
  { value: 'tg', label: 'Телеграм' },
  { value: 'phone', label: 'Звонок' },
]

const { form } = useCheckoutStore()

function toggleMessenger(value: string) {
  const idx = form.messengers.indexOf(value)
  if (idx === -1) form.messengers.push(value)
  else form.messengers.splice(idx, 1)
}
</script>

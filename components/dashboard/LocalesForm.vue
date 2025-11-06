<template>
  <div class="p-4 max-w-4xl mx-auto space-y-4">
    <UInput
      v-model="searchQuery"
      placeholder="Search locales..."
      icon="i-heroicons-magnifying-glass"
      size="md"
      class="mb-4"
    />

    <div class="flex items-center gap-2 p-3 mb-4 bg-gray-50 rounded-lg">
      <UInput v-model="newLocale.key" placeholder="New key" class="flex-1" />
      <UInput
        v-model="newLocale.value"
        placeholder="New value"
        class="flex-1"
      />
      <UButton color="primary" @click="addNewLocale">Add</UButton>
    </div>

    <div class="space-y-2">
      <div
        v-for="[key, value] in Object.entries(filteredLocales)"
        :key="key"
        class="flex items-center justify-between p-4 hover:bg-gray-50/50
          rounded-lg border-b border-gray-100 transition-colors duration-200"
      >
        <div class="font-medium flex-1 text-gray-900 text-sm">{{ key }}</div>

        <div class="flex items-center gap-3 flex-[2]">
          <template v-if="editedKey === key">
            <UInput
              v-model="editedValue"
              class="flex-1"
              size="sm"
              @keyup.enter="saveChanges"
            />
            <UButton
              color="primary"
              variant="solid"
              size="xs"
              @click="saveChanges"
            >
              Save
            </UButton>
          </template>
          <template v-else>
            <span class="text-gray-600 text-sm">{{ value }}</span>
            <div class="flex items-center gap-1">
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-heroicons-pencil-square"
                @click="editLocale(key, value)"
              />
              <UButton
                color="error"
                variant="ghost"
                size="xs"
                icon="i-heroicons-trash"
                @click="store.deleteLocale(key)"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { UButton, UInput } from '#components'
  import { useLocalesStore } from '~/stores/locales'

  const store = useLocalesStore()
  const searchQuery = ref('')
  const editedKey = ref('')
  const editedValue = ref('')
  const newLocale = ref({
    key: '',
    value: '',
  })

  const filteredLocales = computed(() => {
    if (!store.locales) return {}
    return Object.fromEntries(
      Object.entries(store.locales).filter(([key]) =>
        key.toLowerCase().includes(searchQuery.value.toLowerCase()),
      ),
    )
  })

  function editLocale(key: string, value: string) {
    editedKey.value = key
    editedValue.value = value
  }

  async function saveChanges() {
    if (!store.locales || !editedKey.value) return

    const updatedLocales = {
      ...store.locales,
      [editedKey.value]: editedValue.value,
    }

    await store.updateLocales(updatedLocales)
    editedKey.value = ''
    editedValue.value = ''
  }

  async function addNewLocale() {
    if (!store.locales) return

    if (
      newLocale.value.key.trim() === '' ||
      newLocale.value.value.trim() === ''
    ) {
      alert('Please fill both key and value fields')
      return
    }

    if (store.locales[newLocale.value.key]) {
      alert('Locale with this key already exists')
      return
    }

    const updatedLocales = {
      ...store.locales,
      [newLocale.value.key]: newLocale.value.value,
    }

    await store.updateLocales(updatedLocales)
    newLocale.value = { key: '', value: '' }
  }
</script>

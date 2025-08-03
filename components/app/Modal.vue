<template>
  <article
    class="fixed inset-0 backdrop-blur-sm z-40 flex items-center justify-center"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full z-50">
      <header class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold"><slot name="header" /></h3>
        <button class="text-gray-500 hover:text-gray-700" @click="closeModal">
          <UIcon name="heroicons:x-mark-16-solid" />
        </button>
      </header>
      <slot class="mb-4" />
    </div>
  </article>
</template>

<script setup lang="ts">
  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }
</script>

<style scoped lang="scss"></style>

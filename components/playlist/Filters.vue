<template>
  <div class="flex flex-col gap-y-4 md:col-span-1 lg:gap-y-6">
    <AppFormField
      id="search"
      type="search"
      placeholder="Playlist Title"
      :model-value="formData.modelValue"
    />
    <div class="flex flex-col gap-y-2">
      <h3 class="font-semibold sm:text-lg dark:text-white">Tags</h3>
      <TagList />
    </div>
  </div>
</template>

<script setup lang="ts">
  const formData = reactive({
    id: '',
    type: 'search',
    placeholder: 'Playlist Title',
    modelValue: '', // add this line
  })
</script>

<style scoped lang="scss"></style>

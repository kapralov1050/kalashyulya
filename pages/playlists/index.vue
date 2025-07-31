<template>
  <section class="flex flex-col gap-y-8 pt-24 pb-12 sm:py-16 md:gap-y-12">
    <AppSectionHeader
      type="page"
      heading="Подборки уроков"
      subheading="Здесь ты можешь выбрать подходящую тему для изучения"
    />
    <div
      class="container grid grid-cols-1 gap-y-4 sm:gap-8 md:grid-cols-3
        md:gap-x-6 xl:grid-cols-4 xl:gap-x-8"
    >
      <PlaylistFilters />
      <PlaylistGrid />
    </div>
  </section>
</template>

<script setup lang="ts"></script>

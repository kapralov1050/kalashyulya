<template>
  <div class="pt-10 pb-16">
    <AppSectionHeader
      class="mb-10"
      type="page"
      heading="Выставки"
      subheading="Актуальные и прошедшие экспозиции"
    />

    <section class="container">
      <div
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3
          xl:grid-cols-4"
      >
        <ExhibitionCard
          v-for="exhibition in exhibitions"
          :key="exhibition.id"
          :exhibition="exhibition"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import ExhibitionCard from '~/components/exhibitions/ExhibitionCard.vue'

  definePageMeta({
    layout: 'default',
  })

  useSeo({
    title: 'Выставки',
    description: 'Актуальные и прошедшие выставки художника.',
    image: '/logo.png',
  })

  const { exhibitions } = storeToRefs(useExhibitionsStore())

  onMounted(async () => {
    metrics.trackPageView('exhibitions')
  })
</script>

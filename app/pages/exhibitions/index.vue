<template>
  <div class="pt-10 pb-16">
    <AppSectionHeader
      class="mb-10"
      type="page"
      :heading="printLocale('exhibitions_page_heading')"
      :subheading="printLocale('exhibitions_page_subheading')"
    />

    <section class="container">
      <div
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3
          xl:grid-cols-4"
      >
        <template v-if="isLoading">
          <ExhibitionCardSkeleton v-for="i in 4" :key="i" />
        </template>
        <template v-else>
          <ExhibitionCard
            v-for="exhibition in exhibitions"
            :key="exhibition.id"
            :exhibition="exhibition"
          />
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import ExhibitionCard from '~/components/exhibitions/ExhibitionCard.vue'
  import ExhibitionCardSkeleton from '~/components/exhibitions/ExhibitionCardSkeleton.vue'

  const { printLocale } = useLocales()

  definePageMeta({
    layout: 'default',
  })

  useSeo({
    title: 'Выставки',
    description: 'Актуальные и прошедшие выставки художника.',
    image: '/logo.png',
  })

  const { exhibitions, isLoading } = storeToRefs(useExhibitionsStore())

</script>

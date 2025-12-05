<template>
  <div>
    <AppHero>
      <AppHeroContent>
        <template #subtitle>
          {{ printLocale('mainpage_heroTitleAqua') }}
        </template>
        <template #title>
          {{ printLocale('mainpage_heroTitleAutor') }}
        </template>
        <template #description>
          {{ printLocale('mainpage_heroDescription') }}
        </template>
        <template #buttons>
          <UButton
            icon="heroicons:paper-airplane"
            to="/playlists"
            size="xl"
            variant="outline"
          >
            {{ printLocale('mainpage_heroMainButton') }}
          </UButton>
          <UButton
            icon="heroicons:paper-airplane"
            to="#features"
            size="xl"
            variant="outline"
          >
            {{ printLocale('mainpage_heroDetailsButton') }}
          </UButton>
        </template>
      </AppHeroContent>
      <AppHeroImage image-src="/editor.jpg" />
    </AppHero>
    <AppFeatures />
    <!-- <AppNewsletter /> -->
  </div>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()

  useSeo({
    title: 'Коллекция уроков',
    description:
      'Уроки акварельной живописи от Юлии Калашниковой. Изучайте технику акварели, пейзажи, портреты и многое другое.',
    image: '/logo.png',
  })

  onMounted(() => {
    scrollTo(0, 0)
  })
</script>

<style scoped></style>

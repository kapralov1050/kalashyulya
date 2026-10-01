<template>
  <nav aria-label="Основное меню" class="hidden lg:block">
    <ul class="flex items-center gap-x-8">
      <li v-for="item in items" :key="item.to">
        <NuxtLink
          :to="item.to"
          :prefetch="item.prefetch"
          :aria-current="item.ariaCurrent"
          class="rounded-sm text-[0.9375rem] font-medium decoration-1
            underline-offset-[6px] transition-colors hover:text-neutral-900
            focus-visible:outline-2 focus-visible:outline-offset-4
            focus-visible:outline-neutral-900 dark:hover:text-white
            dark:focus-visible:outline-white"
          :class="
            item.ariaCurrent
              ? 'text-neutral-900 underline dark:text-white'
              : 'text-neutral-600 dark:text-neutral-300'
          "
        >
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
  const { items } = useMainNav()
</script>

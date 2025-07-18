<template>
  <article class="container">
    <form class="flex flex-col gap-y-4">
      <AppFormField
        id="shop"
        v-model="userName"
        type="text"
        :placeholder="$t('shop.searchPlaceholder')"
        class="w-70% sm:w-96"
      >
        Введите ваше имя
      </AppFormField>
      <AppFormField
        id="shop"
        v-model="userEmail"
        type="text"
        :placeholder="$t('shop.searchPlaceholder')"
        class="w-70% sm:w-96"
      >
        Введите ваш e-mail
      </AppFormField>
      <AppFormField
        id="shop"
        v-model="userNote"
        type="text"
        :placeholder="$t('shop.searchPlaceholder')"
        class="w-70% sm:w-96"
      >
        Комментарий
      </AppFormField>
      <AppButton @click.prevent="sendOrderInfo">Отправить</AppButton>
    </form>
  </article>
</template>

<script setup lang="ts">
  const userName = ref('')
  const userEmail = ref('')
  const userNote = ref('')

  const sendOrderInfo = () => {}
</script>

<style scoped lang="scss"></style>

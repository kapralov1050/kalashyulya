<template>
  <article class="container">
    <DashboardNewProductForm />
    <div>
      <div
        v-for="product in shopStore.allProducts"
        :key="product.id"
        class="grid grid-cols-4"
      >
        <h1>{{ product.title }}</h1>
        <p>{{ product.stock }}</p>
        <p>{{ product.price }}</p>
        <button class="pointer" @click="removeProduct(product.id)">
          Удалить
        </button>
      </div>
    </div>
    <button @click="quitFromAdminPanel">Выйти</button>
  </article>
</template>

<script setup lang="ts">
  import { useFirebase } from '~/composables/firebase/useFirebase'
  import { removeDataByPath } from '~/helpers/firebase/manageDatabase'

  const shopStore = useShopStore()
  const { logOut } = useFirebase()
  const router = useRouter()

  definePageMeta({
    middleware: 'auth',
  })

  const quitFromAdminPanel = () => {
    logOut()
    router.push('/')
  }

  const removeProduct = (productid: number) => {
    console.log(`shop/products/product_${productid}`)
    removeDataByPath(`shop/products/product_${productid}`)
  }
</script>

<style scoped lang="scss"></style>

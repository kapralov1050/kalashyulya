<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Личный кабинет</h1>
        <p class="text-gray-600 mt-2">Управление вашими данными и заказами</p>
      </div>

      <!-- Состояния загрузки и ошибок -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>
      </div>

      <!-- <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-6"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="h-5 w-5 text-red-400"
            />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Ошибка загрузки</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div> -->

      <!-- Основной контент -->
      <div v-else-if="userProfileData" class="space-y-6">
        <!-- Карточка с основной информацией -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-8">
            <div class="flex items-center space-x-4">
              <!-- Аватар -->
              <div class="flex-shrink-0">
                <div
                  class="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600
                    rounded-full flex items-center justify-center"
                >
                  <span class="text-white font-bold text-xl">
                    {{ userProfileData.name?.charAt(0) || 'U' }}
                  </span>
                </div>
              </div>

              <!-- Информация -->
              <div class="flex-1 min-w-0">
                <h2 class="text-2xl font-bold text-gray-900 truncate">
                  {{ userProfileData.name }}
                </h2>
                <p class="text-gray-600 mt-1 flex items-center">
                  <UIcon name="i-heroicons-envelope" class="h-4 w-4 mr-2" />
                  {{ userProfileData.email }}
                </p>
                <div class="mt-2">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full
                      text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <UIcon name="i-heroicons-user" class="h-3 w-3 mr-1" />
                    {{
                      userProfileData.role === 'user'
                        ? 'Покупатель'
                        : userProfileData.role
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Заказы -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Мои заказы</h3>
          </div>
          <div class="p-6">
            <div
              v-if="
                !userProfileData.orders || userProfileData.orders.length === 0
              "
              class="text-center py-8"
            >
              <UIcon
                name="i-heroicons-shopping-bag"
                class="h-12 w-12 text-gray-400 mx-auto"
              />
              <p class="mt-4 text-gray-500">У вас пока нет заказов</p>
              <UButton to="/shop" color="primary" variant="solid" class="mt-4">
                Перейти в магазин
              </UButton>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="order in userProfileData.orders"
                :key="order.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md
                  transition-shadow"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900">
                      Заказ #{{ order.id }}
                    </p>
                    <p class="text-sm text-gray-500">{{ order.date }}</p>
                  </div>
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800',
                    ]"
                  >
                    {{
                      order.status === 'completed'
                        ? 'Завершен'
                        : order.status === 'processing'
                          ? 'В обработке'
                          : 'Новый'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Действия -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Действия</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UButton
                variant="outline"
                class="justify-start"
                @click="$router.push('/shop')"
              >
                <UIcon name="i-heroicons-shopping-cart" class="h-5 w-5 mr-2" />
                Продолжить покупки
              </UButton>

              <UButton
                variant="outline"
                class="justify-start"
                @click="$router.push('/support')"
              >
                <UIcon
                  name="i-heroicons-chat-bubble-left-right"
                  class="h-5 w-5 mr-2"
                />
                Служба поддержки
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Если данных нет -->
      <div v-else class="text-center py-12">
        <UIcon
          name="i-heroicons-user-circle"
          class="h-16 w-16 text-gray-400 mx-auto"
        />
        <p class="mt-4 text-gray-500">Данные пользователя не найдены</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    middleware: 'user-auth',
  })

  const { userProfileData } = storeToRefs(useProfileStore())
  const { loadUserData } = useProfileStore()
  const { currentUser } = useAuthStore()

  const isLoading = ref(false)

  onMounted(async () => {
    if (currentUser && currentUser.uid) {
      isLoading.value = true
      await loadUserData(currentUser.uid)
      isLoading.value = false
    }
  })
</script>

<style scoped lang="scss"></style>

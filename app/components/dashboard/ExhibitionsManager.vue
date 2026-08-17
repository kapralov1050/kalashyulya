<template>
  <div class="space-y-6">
    <!-- Edit view -->
    <ExhibitionEditForm
      v-if="editingExhibition"
      :exhibition="editingExhibition"
      @cancel="editingExhibition = null"
      @saved="editingExhibition = null"
    />

    <!-- List view -->
    <template v-else>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">Выставки</h2>
        <span class="text-sm text-gray-500">
          {{ pluralize(exhibitions.length, 'exhibitions') }}
        </span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="space-y-3">
        <div
          v-for="i in 3"
          :key="i"
          class="h-20 animate-pulse rounded-xl bg-gray-100"
        />
      </div>

      <!-- Empty -->
      <div
        v-else-if="exhibitions.length === 0"
        class="rounded-xl border border-dashed border-gray-300 py-16
          text-center"
      >
        <p class="text-sm text-gray-500">Выставок пока нет</p>
      </div>

      <!-- Exhibition cards -->
      <div v-else class="space-y-3">
        <div
          v-for="exhibition in sortedExhibitions"
          :key="exhibition.id"
          class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white
            p-4 shadow-sm sm:flex-row sm:items-center"
        >
          <!-- Status dot + info -->
          <div class="flex min-w-0 flex-1 items-start gap-3">
            <span
              class="mt-1 inline-block size-2.5 shrink-0 rounded-full"
              :class="statusDotClass(exhibition.status)"
            />
            <div class="min-w-0">
              <p class="truncate font-semibold text-gray-900">
                {{ exhibition.title.replace(/\\n/g, ' ') }}
              </p>
              <p class="mt-0.5 text-xs text-gray-500">
                {{ exhibition.dateRange || 'Даты не указаны' }}
                <span
                  v-if="exhibition.isFree"
                  class="ml-2 rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs
                    font-medium text-emerald-700"
                >
                  Вход свободный
                </span>
              </p>
            </div>
          </div>

          <!-- Quick status change -->
          <select
            :value="exhibition.status"
            class="rounded-lg border border-gray-300 px-2 py-1.5 text-sm
              text-gray-700 focus:border-blue-500 focus:outline-none
              focus:ring-1 focus:ring-blue-500"
            :disabled="savingStatusId === exhibition.id"
            @change="
              changeStatus(
                exhibition,
                ($event.target as HTMLSelectElement).value as ExhibitionStatus,
              )
            "
          >
            <option value="planned">Запланирована</option>
            <option value="ongoing">Идёт сейчас</option>
            <option value="finished">Завершена</option>
          </select>

          <!-- Edit button -->
          <button
            type="button"
            class="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm
              font-medium text-gray-700 transition hover:bg-gray-50
              hover:border-gray-400"
            @click="editingExhibition = exhibition"
          >
            Редактировать
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { Exhibition, ExhibitionStatus } from '~/types'
  import { showToast } from '~/helpers/showToast'
  import { pluralize } from '~/utils/pluralize'
  import ExhibitionEditForm from './ExhibitionEditForm.vue'

  const exhibitionsStore = useExhibitionsStore()
  const { exhibitions, isLoading } = storeToRefs(exhibitionsStore)

  const editingExhibition = ref<Exhibition | null>(null)
  const savingStatusId = ref<string | null>(null)

  const sortedExhibitions = computed(() =>
    [...exhibitions.value].sort((a, b) => {
      const order: Record<ExhibitionStatus, number> = {
        ongoing: 0,
        planned: 1,
        finished: 2,
      }
      return order[a.status] - order[b.status]
    }),
  )

  function statusDotClass(status: ExhibitionStatus) {
    switch (status) {
      case 'planned':
        return 'bg-blue-500'
      case 'ongoing':
        return 'bg-emerald-500'
      case 'finished':
        return 'bg-amber-400'
    }
  }

  async function changeStatus(
    exhibition: Exhibition,
    newStatus: ExhibitionStatus,
  ) {
    savingStatusId.value = exhibition.id
    try {
      const { addressLine, ...restLocation } = exhibition.location
      await exhibitionsStore.updateExhibition(exhibition.id, {
        ...exhibition,
        location: { ...restLocation, address: addressLine },
        works: exhibition.works.map(w => ({ title: w.title })),
        status: newStatus,
      })
      showToast(
        'Статус обновлён',
        exhibitionsStore.getStatusLabel(newStatus),
        'heroicons:check-circle',
      )
    } catch (err) {
      showToast('Ошибка', String(err), 'heroicons:exclamation-circle')
    } finally {
      savingStatusId.value = null
    }
  }
</script>

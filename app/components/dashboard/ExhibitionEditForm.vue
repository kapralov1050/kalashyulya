<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Редактировать выставку</h2>
        <p class="mt-0.5 text-sm text-gray-500">
          ID: exhibition_{{ exhibition.id }} ·
          <span class="font-mono text-blue-600">
            /exhibitions/{{ exhibition.slug }}
          </span>
        </p>
      </div>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3
          py-2 text-sm text-gray-600 hover:bg-gray-50"
        @click="$emit('cancel')"
      >
        ← Назад
      </button>
    </div>

    <!-- 1. Основная информация -->
    <ExhibitionFormSection title="Основная информация">
      <div class="grid gap-4 sm:grid-cols-2">
        <!-- Название -->
        <div class="sm:col-span-2">
          <label
            for="edit-title"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Название
          </label>
          <textarea
            id="edit-title"
            v-model="form.title"
            rows="2"
            placeholder="Выставка «Тихий свет зимы»"
            class="w-full resize-none rounded-lg border border-gray-300 px-3
              py-2.5 text-sm focus:border-blue-500 focus:outline-none
              focus:ring-1 focus:ring-blue-500"
          />
          <p class="mt-1 text-xs text-gray-500">
            Enter — перенос строки в заголовке
          </p>
          <div
            v-if="form.title"
            class="mt-3 overflow-hidden rounded-xl bg-neutral-900 px-5 py-4"
          >
            <p class="mb-2 text-xs font-medium text-neutral-500">
              Превью заголовка
            </p>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p
              class="text-2xl font-black leading-tight text-white"
              v-html="titlePreview"
            />
          </div>
        </div>

        <AppFormField
          id="edit-tab-title"
          v-model="form.tabTitle"
          label="Заголовок вкладки браузера"
          placeholder="Выставка «Тихий свет зимы»"
        />

        <!-- Slug -->
        <div>
          <AppFormField
            id="edit-slug"
            v-model="form.slug"
            label="Slug (URL)"
            placeholder="tikhij-svet-zimy"
          />
          <p class="mt-1 text-xs text-amber-600">
            Осторожно: изменение slug сломает существующие ссылки
          </p>
          <p class="mt-0.5 text-xs text-gray-500">
            Адрес:
            <span class="font-mono text-blue-600">
              /exhibitions/{{ form.slug || '…' }}
            </span>
          </p>
        </div>

        <!-- Статус -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">
            Статус
          </label>
          <select
            v-model="form.status"
            class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
              focus:border-blue-500 focus:outline-none focus:ring-1
              focus:ring-blue-500"
          >
            <option value="planned">Запланирована</option>
            <option value="ongoing">Идёт сейчас</option>
            <option value="finished">Завершена</option>
          </select>
        </div>

        <!-- Даты -->
        <AppFormField
          id="edit-date-range"
          v-model="form.dateRange"
          label="Период (текст)"
          placeholder="1–28 февраля 2026"
        />
        <AppFormField
          id="edit-date-start"
          v-model="form.dateStart"
          type="date"
          label="Дата начала"
        />
        <AppFormField
          id="edit-date-end"
          v-model="form.dateEnd"
          type="date"
          label="Дата окончания"
        />

        <!-- Вход -->
        <div class="flex items-center gap-3">
          <label
            class="flex cursor-pointer items-center gap-2 text-sm font-medium
              text-gray-700"
          >
            <input
              v-model="form.isFree"
              type="checkbox"
              class="h-4 w-4 rounded text-blue-500 focus:ring-blue-400"
            />
            Вход свободный
          </label>
        </div>
        <AppFormField
          id="edit-ticket-info"
          v-model="form.ticketInfo"
          label="Информация о билетах"
          placeholder="Вход свободный"
        />

        <div class="sm:col-span-2">
          <AppFormField
            id="edit-short-desc"
            v-model="form.shortDescription"
            type="textarea"
            label="Краткое описание (для карточки)"
            placeholder="Акварельная выставка зимних пленэрных работ..."
          />
        </div>
      </div>
    </ExhibitionFormSection>

    <!-- 2. Обложка -->
    <ExhibitionFormSection title="Обложка выставки">
      <div class="space-y-3">
        <div class="relative">
          <AppFormField
            id="edit-cover-search"
            v-model="coverSearch"
            label="Найти работу из магазина"
            placeholder="Введите название картины..."
          />
          <ul
            v-if="coverResults.length > 0"
            class="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl
              border border-gray-200 bg-white shadow-lg"
          >
            <li
              v-for="product in coverResults"
              :key="product.id"
              class="flex cursor-pointer items-center gap-3 px-3 py-2
                hover:bg-gray-50"
              @click="selectCoverProduct(product)"
            >
              <img
                v-if="product.image?.[0]"
                :src="product.image[0]"
                :alt="product.title"
                class="size-10 rounded-md object-cover"
              />
              <div
                v-else
                class="flex size-10 items-center justify-center rounded-md
                  bg-gray-100 text-xs text-gray-400"
              >
                нет
              </div>
              <span class="text-sm text-gray-800">{{ product.title }}</span>
            </li>
          </ul>
        </div>

        <AppFormField
          id="edit-cover-url"
          v-model="form.coverImage"
          label="URL обложки (или введите вручную)"
          placeholder="https://..."
        />

        <div
          v-if="form.coverImage"
          class="overflow-hidden rounded-xl border border-gray-200"
        >
          <img
            :src="form.coverImage"
            alt="Обложка"
            class="h-48 w-full object-cover"
          />
        </div>
        <p v-else class="text-sm text-gray-400">Обложка не выбрана</p>
      </div>
    </ExhibitionFormSection>

    <!-- 3. Место проведения -->
    <ExhibitionFormSection title="Место проведения">
      <div class="grid gap-4 sm:grid-cols-2">
        <AppFormField
          id="edit-venue"
          v-model="form.location.venue"
          label="Название места"
          placeholder="Библиотека К.А. Тимирязева"
        />
        <AppFormField
          id="edit-city"
          v-model="form.location.city"
          label="Город"
          placeholder="Санкт-Петербург"
        />
        <AppFormField
          id="edit-address"
          v-model="form.location.address"
          label="Адрес"
          placeholder="ул. Шкапина, д. 6"
        />
        <AppFormField
          id="edit-map-link"
          v-model="form.location.mapLink"
          label="Ссылка на Яндекс.Карты"
          placeholder="https://yandex.ru/map-widget/..."
        />
        <div class="sm:col-span-2">
          <UFormField label="Станции метро">
            <UInputTags
              v-model="form.location.metro"
              placeholder="Введите станцию и нажмите Enter..."
            />
          </UFormField>
        </div>
      </div>
    </ExhibitionFormSection>

    <!-- 4. Расписание -->
    <ExhibitionFormSection title="Расписание">
      <div class="divide-y divide-gray-100 rounded-xl border border-gray-200">
        <div
          v-for="day in form.schedule"
          :key="day.id"
          class="flex flex-wrap items-center gap-3 px-4 py-3"
        >
          <span class="w-32 text-sm font-medium text-gray-700">
            {{ day.label }}
          </span>
          <div class="flex flex-1 items-center gap-3">
            <input
              v-model="day.time"
              type="text"
              :disabled="day.isClosed"
              placeholder="09:00–20:00"
              class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5
                text-sm focus:border-blue-500 focus:outline-none focus:ring-1
                focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <label
              class="flex cursor-pointer items-center gap-1.5 text-sm
                text-gray-600"
            >
              <input
                v-model="day.isClosed"
                type="checkbox"
                class="h-4 w-4 rounded text-rose-500 focus:ring-rose-400"
                @change="onClosedToggle(day)"
              />
              Закрыто
            </label>
          </div>
        </div>
      </div>
    </ExhibitionFormSection>

    <!-- 5. Описание -->
    <ExhibitionFormSection title="Описание">
      <div class="space-y-4">
        <AppFormField
          id="edit-desc-intro"
          v-model="form.descriptionIntro"
          type="textarea"
          label="Вводный абзац"
          placeholder="С 1 февраля 2026 года в библиотеке..."
        />
        <AppFormField
          id="edit-desc-body"
          v-model="form.descriptionBody"
          type="textarea"
          label="Основной текст"
          placeholder="«Часть работ создана в Ивановской области...»"
        />
        <p class="text-xs text-gray-500">
          Нажмите Enter дважды, чтобы начать новый абзац
        </p>
      </div>
    </ExhibitionFormSection>

    <!-- 6. Работы на выставке -->
    <ExhibitionFormSection title="Работы на выставке">
      <div class="space-y-4">
        <div v-if="form.works.length > 0">
          <p class="mb-2 text-sm font-medium text-gray-700">
            Добавлено: {{ form.works.length }}
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(work, idx) in form.works"
              :key="idx"
              class="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1
                text-sm text-blue-800 ring-1 ring-blue-200"
            >
              {{ work.title }}
              <button
                type="button"
                class="rounded-full text-blue-400 hover:text-blue-700"
                @click="removeWork(idx)"
              >
                ×
              </button>
            </span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400">Работы не добавлены</p>

        <div>
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <AppFormField
                id="edit-works-search"
                v-model="worksSearch"
                label=""
                placeholder="Поиск по названию работы..."
              />
            </div>
            <button
              type="button"
              class="mt-0.5 flex items-center gap-1 rounded-lg border
                border-gray-300 px-3 py-2.5 text-sm text-gray-600
                hover:bg-gray-50"
              @click="worksOpen = !worksOpen"
            >
              {{ worksOpen ? '▲ Скрыть' : '▼ Показать все' }}
            </button>
          </div>

          <div v-if="worksOpen || worksSearch" class="mt-3">
            <p class="mb-2 text-xs text-gray-500">
              Нажмите на работу, чтобы добавить или убрать её
            </p>
            <div
              class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4
                lg:grid-cols-5"
            >
              <button
                v-for="product in worksResults"
                :key="product.id"
                type="button"
                class="group relative overflow-hidden rounded-xl border-2
                  transition-all"
                :class="
                  isWorkSelected(product)
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300'
                "
                @click="toggleWork(product)"
              >
                <img
                  v-if="product.image?.[0]"
                  :src="product.image[0]"
                  :alt="product.title"
                  class="aspect-square w-full object-cover"
                />
                <div
                  v-else
                  class="flex aspect-square w-full items-center justify-center
                    bg-gray-100 text-xs text-gray-400"
                >
                  нет фото
                </div>
                <div
                  class="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5"
                >
                  <p class="truncate text-xs text-white">{{ product.title }}</p>
                </div>
                <div
                  v-if="isWorkSelected(product)"
                  class="absolute right-1.5 top-1.5 flex size-5 items-center
                    justify-center rounded-full bg-blue-500 text-xs text-white"
                >
                  ✓
                </div>
              </button>
            </div>
            <p
              v-if="worksResults.length === 0"
              class="py-6 text-center text-sm text-gray-400"
            >
              Ничего не найдено
            </p>
          </div>
        </div>
      </div>
    </ExhibitionFormSection>

    <!-- Кнопки -->
    <div class="flex items-center justify-end gap-3 pt-2">
      <button
        type="button"
        class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm
          text-gray-600 hover:bg-gray-50"
        @click="$emit('cancel')"
      >
        Отмена
      </button>
      <UButton loading-auto size="xl" :disabled="isSaving" @click="submit">
        {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Exhibition, ExhibitionStatus, Product } from '~/types'
  import { showToast } from '~/helpers/showToast'
  import ExhibitionFormSection from './ExhibitionFormSection.vue'

  const props = defineProps<{ exhibition: Exhibition }>()
  const emit = defineEmits<{ cancel: []; saved: [] }>()

  const exhibitionsStore = useExhibitionsStore()
  const shopStore = useShopStore()

  // ─── Конвертация текста ───────────────────────────────────────────────────────

  // Firebase хранит буквальные \n (два символа). Для textarea нужны реальные переносы.
  const fromFirebaseText = (s: string) => s.replace(/\\n/g, '\n')
  const toFirebaseText = (s: string) => s.replace(/\n/g, '\\n')

  // ─── Form state ───────────────────────────────────────────────────────────────

  const form = reactive({
    title: fromFirebaseText(props.exhibition.title),
    tabTitle: props.exhibition.tabTitle || '',
    slug: props.exhibition.slug,
    shortDescription: props.exhibition.shortDescription || '',
    dateRange: props.exhibition.dateRange || '',
    dateStart: props.exhibition.dateStart || '',
    dateEnd: props.exhibition.dateEnd || '',
    status: props.exhibition.status as ExhibitionStatus,
    isFree: props.exhibition.isFree ?? false,
    ticketInfo: props.exhibition.ticketInfo || '',
    coverImage: props.exhibition.coverImage || '',
    location: {
      venue: props.exhibition.location.venue || '',
      city: props.exhibition.location.city || '',
      address: props.exhibition.location.addressLine || '',
      metro: [...(props.exhibition.location.metro || [])],
      mapLink: props.exhibition.location.mapLink || '',
    },
    schedule: props.exhibition.schedule.map(d => ({ ...d })),
    descriptionIntro: props.exhibition.descriptionIntro || '',
    descriptionBody: fromFirebaseText(props.exhibition.descriptionBody || ''),
    works: props.exhibition.works.map(w => ({ title: w.title })),
  })

  function onClosedToggle(day: (typeof form.schedule)[number]) {
    if (day.isClosed) day.time = 'Закрыто'
    else day.time = ''
  }

  // ─── Title preview ────────────────────────────────────────────────────────────

  const titlePreview = computed(() =>
    form.title
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>'),
  )

  // ─── Cover image search ───────────────────────────────────────────────────────

  const coverSearch = ref('')

  const coverResults = computed<Product[]>(() => {
    if (!coverSearch.value.trim()) return []
    return shopStore.allProducts.value
      .filter(p =>
        p.title.toLowerCase().includes(coverSearch.value.toLowerCase()),
      )
      .slice(0, 10)
  })

  function selectCoverProduct(product: Product) {
    form.coverImage = product.image?.[0] ?? ''
    coverSearch.value = ''
  }

  // ─── Works picker ────────────────────────────────────────────────────────────

  const worksSearch = ref('')
  const worksOpen = ref(false)

  const worksResults = computed<Product[]>(() => {
    const q = worksSearch.value.toLowerCase().trim()
    const all = shopStore.allProducts.value
    if (!q && !worksOpen.value) return []
    return q ? all.filter(p => p.title.toLowerCase().includes(q)) : all
  })

  function isWorkSelected(product: Product) {
    return form.works.some(w => w.title === product.title)
  }

  function toggleWork(product: Product) {
    if (isWorkSelected(product)) {
      form.works = form.works.filter(w => w.title !== product.title)
    } else {
      form.works.push({ title: product.title })
    }
  }

  function removeWork(idx: number) {
    form.works.splice(idx, 1)
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────

  const isSaving = ref(false)

  async function submit() {
    if (!form.title.trim()) {
      showToast(
        'Ошибка',
        'Введите название выставки',
        'heroicons:exclamation-circle',
      )
      return
    }

    isSaving.value = true
    try {
      const payload = {
        id: props.exhibition.id,
        title: toFirebaseText(form.title),
        tabTitle: form.tabTitle,
        slug: form.slug,
        shortDescription: form.shortDescription,
        dateRange: form.dateRange,
        dateStart: form.dateStart,
        dateEnd: form.dateEnd,
        status: form.status,
        isFree: form.isFree,
        ticketInfo: form.ticketInfo,
        coverImage: form.coverImage,
        location: { ...form.location },
        schedule: form.schedule.map(d => ({ ...d })),
        descriptionIntro: form.descriptionIntro,
        descriptionBody: toFirebaseText(form.descriptionBody),
        works: form.works.map(w => ({ ...w })),
      }

      await exhibitionsStore.updateExhibition(props.exhibition.id, payload)
      showToast(
        'Сохранено',
        `Выставка «${form.title.replace(/\n/g, ' ')}» обновлена`,
        'heroicons:check-circle',
      )
      emit('saved')
    } catch (err) {
      showToast('Ошибка', String(err), 'heroicons:exclamation-circle')
    } finally {
      isSaving.value = false
    }
  }
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900">Добавить выставку</h2>
    </div>

    <!-- 1. Основная информация -->
    <ExhibitionFormSection title="Основная информация">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label
            for="ex-title"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Название
          </label>
          <textarea
            id="ex-title"
            v-model="form.title"
            rows="2"
            placeholder="Выставка «Тихий свет зимы»"
            class="w-full resize-none rounded-lg border border-gray-300 px-3
              py-2.5 text-sm focus:border-blue-500 focus:outline-none
              focus:ring-1 focus:ring-blue-500"
          />
          <p class="mt-1 text-xs text-gray-500">
            Нажмите Enter, чтобы перенести часть названия на следующую строку
          </p>
          <!-- Превью заголовка -->
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
          id="ex-tab-title"
          v-model="form.tabTitle"
          label="Заголовок вкладки браузера"
          placeholder="Выставка «Тихий свет зимы»"
        />

        <div>
          <AppFormField
            id="ex-slug"
            v-model="form.slug"
            label="Slug (URL)"
            placeholder="tikhij-svet-zimy"
          />
          <p class="mt-1 text-xs text-gray-500">
            Используется в адресе страницы:
            <span class="font-mono text-blue-600">/exhibitions/{{ form.slug || 'slug' }}</span>.
            Только латинские буквы и дефисы.
          </p>
          <button
            type="button"
            class="mt-1 text-xs text-blue-600 hover:underline"
            @click="generateSlug"
          >
            Сгенерировать из названия
          </button>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Статус</label>
          <select
            v-model="form.status"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5
              text-sm text-gray-900 focus:border-blue-500 focus:outline-none
              focus:ring-2 focus:ring-blue-500"
          >
            <option value="planned">Запланирована</option>
            <option value="ongoing">Уже идёт</option>
            <option value="finished">Завершена</option>
          </select>
        </div>

        <AppFormField
          id="ex-date-range"
          v-model="form.dateRange"
          label="Период (отображаемый текст)"
          placeholder="1–28 февраля 2026"
        />

        <AppFormField
          id="ex-date-start"
          v-model="form.dateStart"
          type="date"
          label="Дата начала"
        />

        <AppFormField
          id="ex-date-end"
          v-model="form.dateEnd"
          type="date"
          label="Дата окончания"
        />

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Вход свободный</label>
          <button
            type="button"
            class="flex h-10 w-14 items-center rounded-full px-1 transition-colors"
            :class="form.isFree ? 'bg-emerald-500' : 'bg-gray-300'"
            @click="form.isFree = !form.isFree"
          >
            <span
              class="size-8 rounded-full bg-white shadow transition-transform"
              :class="form.isFree ? 'translate-x-4' : 'translate-x-0'"
            />
          </button>
        </div>

        <AppFormField
          id="ex-ticket"
          v-model="form.ticketInfo"
          label="Информация о билетах"
          placeholder="Вход свободный"
        />

        <div class="sm:col-span-2">
          <AppFormField
            id="ex-short-desc"
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
            id="ex-cover-search"
            v-model="coverSearch"
            label="Найти работу из магазина"
            placeholder="Введите название картины..."
          />
          <!-- Выпадающий список результатов -->
          <ul
            v-if="coverResults.length > 0"
            class="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl
              border border-gray-200 bg-white shadow-lg"
          >
            <li
              v-for="product in coverResults"
              :key="product.id"
              class="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50"
              @click="selectCoverProduct(product)"
            >
              <img
                v-if="product.image?.[0]"
                :src="product.image[0]"
                :alt="product.title"
                class="size-10 rounded-md object-cover"
              >
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
          id="ex-cover-url"
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
          >
        </div>
        <p v-else class="text-sm text-gray-400">Обложка не выбрана</p>
      </div>
    </ExhibitionFormSection>

    <!-- 3. Место проведения -->
    <ExhibitionFormSection title="Место проведения">
      <div class="grid gap-4 sm:grid-cols-2">
        <AppFormField
          id="ex-venue"
          v-model="form.location.venue"
          label="Название места"
          placeholder="Библиотека К.А. Тимирязева"
        />
        <AppFormField
          id="ex-city"
          v-model="form.location.city"
          label="Город"
          placeholder="Санкт-Петербург"
        />
        <AppFormField
          id="ex-address"
          v-model="form.location.address"
          label="Адрес"
          placeholder="ул. Шкапина, д. 6"
        />
        <AppFormField
          id="ex-map-link"
          v-model="form.location.mapLink"
          label="Ссылка на Яндекс.Карты (необязательно)"
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
          <span class="w-32 text-sm font-medium text-gray-700">{{ day.label }}</span>
          <div class="flex flex-1 items-center gap-3">
            <input
              v-model="day.time"
              type="text"
              :disabled="day.isClosed"
              placeholder="09:00–20:00"
              class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm
                focus:border-blue-500 focus:outline-none focus:ring-1
                focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
            <label class="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600">
              <input
                v-model="day.isClosed"
                type="checkbox"
                class="h-4 w-4 rounded text-rose-500 focus:ring-rose-400"
                @change="onClosedToggle(day)"
              >
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
          id="ex-desc-intro"
          v-model="form.descriptionIntro"
          type="textarea"
          label="Вводный абзац"
          placeholder="С 1 февраля 2026 года в библиотеке..."
        />
        <AppFormField
          id="ex-desc-body"
          v-model="form.descriptionBody"
          type="textarea"
          label="Основной текст"
          placeholder="«Часть работ создана в Ивановской области...»"
        />
        <p class="mt-1 text-xs text-gray-500">
          Нажмите Enter дважды, чтобы начать новый абзац
        </p>
      </div>
    </ExhibitionFormSection>

    <!-- 6. Работы на выставке -->
    <ExhibitionFormSection title="Работы на выставке">
      <div class="space-y-4">
        <!-- Выбранные работы -->
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

        <!-- Поиск + раскрывающийся пикер -->
        <div>
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <AppFormField
                id="ex-works-search"
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
                >
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

    <!-- Кнопка сохранения -->
    <div class="flex justify-end pt-2">
      <UButton
        loading-auto
        size="xl"
        :disabled="isSaving"
        @click="submit"
      >
        {{ isSaving ? 'Сохранение...' : 'Создать выставку' }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ExhibitionStatus, Product } from '~/types'
  import { showToast } from '~/helpers/showToast'
  import ExhibitionFormSection from './ExhibitionFormSection.vue'

  const exhibitionsStore = useExhibitionsStore()
  const shopStore = useShopStore()

  // ─── Transliteration ─────────────────────────────────────────────────────────

  const TRANSLIT: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo',
    ж: 'zh', з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm',
    н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
    ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  }

  function toSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[а-яёъыь]/g, ch => TRANSLIT[ch] ?? ch)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // ─── Form state ───────────────────────────────────────────────────────────────

  const defaultSchedule = () => [
    { id: 'mon', label: 'Понедельник', time: '', isClosed: false },
    { id: 'tue', label: 'Вторник',     time: '', isClosed: false },
    { id: 'wed', label: 'Среда',       time: '', isClosed: false },
    { id: 'thu', label: 'Четверг',     time: '', isClosed: false },
    { id: 'fri', label: 'Пятница',     time: '', isClosed: false },
    { id: 'sat', label: 'Суббота',     time: '', isClosed: false },
    { id: 'sun', label: 'Воскресенье', time: '', isClosed: false },
  ]

  const form = reactive({
    title: '',
    tabTitle: '',
    slug: '',
    shortDescription: '',
    dateRange: '',
    dateStart: '',
    dateEnd: '',
    status: 'planned' as ExhibitionStatus,
    isFree: false,
    ticketInfo: '',
    coverImage: '',
    location: {
      venue: '',
      city: '',
      address: '',
      metro: [] as string[],
      mapLink: '',
    },
    schedule: defaultSchedule(),
    descriptionIntro: '',
    descriptionBody: '',
    works: [] as { title: string }[],
  })

  // Экранирует HTML и заменяет реальные \n на <br> для безопасного превью
  const titlePreview = computed(() =>
    form.title
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>'),
  )

  // Конвертирует реальные переносы строк в литеральные \n для Firebase
  const toFirebaseText = (s: string) => s.replace(/\n/g, '\\n')

  function generateSlug() {
    form.slug = toSlug(form.title.replace(/\n/g, ' '))
  }

  function onClosedToggle(day: (typeof form.schedule)[number]) {
    if (day.isClosed) day.time = 'Закрыто'
    else day.time = ''
  }

  // ─── Cover image search ───────────────────────────────────────────────────────

  const coverSearch = ref('')

  const coverResults = computed<Product[]>(() => {
    if (!coverSearch.value.trim()) return []
    return shopStore.allProducts
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
    const all = shopStore.allProducts
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
      showToast('Ошибка', 'Введите название выставки', 'heroicons:exclamation-circle')
      return
    }
    if (!form.slug.trim()) {
      showToast('Ошибка', 'Введите slug', 'heroicons:exclamation-circle')
      return
    }

    isSaving.value = true
    try {
      const payload = {
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

      const newId = await exhibitionsStore.addNewExhibition(payload)
      showToast(
        'Выставка создана',
        `ID: exhibition_${newId} · slug: ${form.slug}`,
        'heroicons:check-circle',
      )

      // Триггерим деплой чтобы новый slug попал в пререндер
      const deployUrl = useRuntimeConfig().public.cloudFunctionDeploy
      const deploySecret = useRuntimeConfig().public.cloudFunctionDeploySecret
      if (deployUrl) {
        fetch(deployUrl, {
          method: 'POST',
          headers: { 'x-secret-key': deploySecret },
        }).catch(() => {
          showToast('Деплой', 'Не удалось запустить пересборку', 'heroicons:exclamation-triangle')
        })
      }

      // Reset form
      Object.assign(form, {
        title: '', tabTitle: '', slug: '', shortDescription: '',
        dateRange: '', dateStart: '', dateEnd: '',
        status: 'planned' as ExhibitionStatus,
        isFree: false, ticketInfo: '', coverImage: '',
        location: { venue: '', city: '', address: '', metro: [], mapLink: '' },
        schedule: defaultSchedule(),
        descriptionIntro: '', descriptionBody: '',
        works: [],
      })
      coverSearch.value = ''
      worksSearch.value = ''
      worksOpen.value = false
    } catch (err) {
      showToast('Ошибка', String(err), 'heroicons:exclamation-circle')
    } finally {
      isSaving.value = false
    }
  }
</script>


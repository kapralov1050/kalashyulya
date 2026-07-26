<template>
  <div class="container flex flex-col items-center justify-center mb-20 pt-10">
    <div class="w-full max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1
          class="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white
            mb-4"
        >
          Политика обработки персональных данных
        </h1>
        <p class="text-neutral-600 dark:text-neutral-400 text-sm">
          Дата обновления: 26 июля 2026 г. · Версия v1.1
        </p>
      </div>

      <UAlert
        class="mb-10"
        icon="heroicons:exclamation-triangle"
        color="warning"
        variant="subtle"
        title="Документ в черновике"
        description="Часть полей содержит плейсхолдеры, которые необходимо заполнить или подтвердить юристу с учётом актуального статуса продавца (самозанятая / ИП)."
      />

      <h2 class="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
        1. Общие положения
      </h2>
      <div
        class="prose prose-neutral dark:prose-invert max-w-none mb-10
          text-neutral-700 dark:text-neutral-300"
      >
        <p>
          Настоящая Политика обработки персональных данных (далее — «Политика»)
          разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
          «О персональных данных» (далее — ФЗ-152) и Приказом Роскомнадзора от
          24.02.2021 № 18 «Об утверждении требований к содержанию политики
          обработки персональных данных, осуществляемой оператором».
        </p>
        <p>
          Оператором персональных данных является самозанятая Капралова Юлия
          (ИНН 370605819158), применяющая специальный налоговый режим «Налог
          на профессиональный доход». Творческий псевдоним «Калашникова Юлия»
          и бренд «kalashyulya» используются Оператором как творческое имя и
          тождественны юридическому лицу Оператора.
        </p>
        <p>
          Политика действует в отношении всех персональных данных, которые
          Оператор получает от субъектов персональных данных — посетителей сайта
          kalashyulya.ru и покупателей товаров в интернет-магазине.
        </p>
        <p>
          Использование сайта и оформление заказов означает безусловное согласие
          субъекта с настоящей Политикой и указанными в ней условиями обработки
          персональных данных. В случае несогласия с условиями Политики
          субъект обязан прекратить использование сайта.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
        2. Термины и определения
      </h2>
      <div
        class="prose prose-neutral dark:prose-invert max-w-none mb-10
          text-neutral-700 dark:text-neutral-300"
      >
        <dl class="space-y-3">
          <div>
            <dt class="font-semibold text-neutral-900 dark:text-white">
              Персональные данные (ПДн)
            </dt>
            <dd>
              любая информация, относящаяся к прямо или косвенно определённому
              либо определяемому физическому лицу (субъекту персональных
              данных).
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-neutral-900 dark:text-white">
              Обработка персональных данных
            </dt>
            <dd>
              любое действие (операция) или совокупность действий (операций),
              совершаемых с использованием средств автоматизации или без них, с
              персональными данными, включая сбор, запись, систематизацию,
              накопление, хранение, уточнение (обновление, изменение),
              извлечение, использование, передачу (распространение,
              предоставление, доступ), обезличивание, блокирование, удаление,
              уничтожение.
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-neutral-900 dark:text-white">
              Субъект персональных данных
            </dt>
            <dd>
              посетитель сайта kalashyulya.ru и/или покупатель, чьи
              персональные данные обрабатываются Оператором.
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-neutral-900 dark:text-white">
              Оператор
            </dt>
            <dd>
              лицо, самостоятельно или совместно с другими лицами
              организующее и/или осуществляющее обработку персональных данных,
              определяющее цели обработки, состав персональных данных,
              подлежащих обработке, и действия (операции), совершаемые с
              персональными данными. Реквизиты Оператора приведены в разделе 3
              настоящей Политики.
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-neutral-900 dark:text-white">
              Предоставление персональных данных
            </dt>
            <dd>
              действия, направленные на раскрытие персональных данных
              определённому лицу или определённому кругу лиц.
            </dd>
          </div>
        </dl>
      </div>

      <h2 class="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
        3. Оператор персональных данных
      </h2>
      <UCard
        class="mb-10"
        :ui="{
          root: 'ring-0',
          body: 'p-0 sm:p-0',
        }"
      >
        <div class="p-6 space-y-4">
          <div>
            <p
              class="text-xs text-neutral-500 dark:text-neutral-400 uppercase
                tracking-wide mb-1"
            >
              ФИО / статус
            </p>
            <p class="text-neutral-800 dark:text-neutral-200 font-medium">
              Капралова Юлия · Самозанятая (НПД)
            </p>
            <p
              class="text-xs text-neutral-500 dark:text-neutral-400 mt-1"
            >
              Творческий псевдоним: Калашникова Юлия (kalashyulya)
            </p>
          </div>
          <div>
            <p
              class="text-xs text-neutral-500 dark:text-neutral-400 uppercase
                tracking-wide mb-1"
            >
              ИНН
            </p>
            <p
              class="text-neutral-800 dark:text-neutral-200 font-medium
                font-mono"
            >
              370605819158
            </p>
          </div>
          <div>
            <p
              class="text-xs text-neutral-500 dark:text-neutral-400 uppercase
                tracking-wide mb-1"
            >
              Адрес
            </p>
            <UAlert
              class="my-2"
              icon="heroicons:exclamation-triangle"
              color="warning"
              variant="subtle"
              title="Заполнить юристу"
              description="Указать адрес регистрации / фактического проживания продавца."
            />
            <p class="text-neutral-800 dark:text-neutral-200 font-medium">
              [адрес — указать]
            </p>
          </div>
          <div>
            <p
              class="text-xs text-neutral-500 dark:text-neutral-400 uppercase
                tracking-wide mb-1"
            >
              Email для обращений по ПДн
            </p>
            <a
              href="mailto:kalashnikova199979@gmail.com"
              class="text-neutral-800 dark:text-neutral-200 font-medium
                hover:text-blue-600 dark:hover:text-blue-400
                transition-colors duration-200"
            >
              kalashnikova199979@gmail.com
            </a>
          </div>
          <div>
            <p
              class="text-xs text-neutral-500 dark:text-neutral-400 uppercase
                tracking-wide mb-1"
            >
              Контактное лицо
            </p>
            <p class="text-neutral-800 dark:text-neutral-200 font-medium">
              Капралова Юлия (она же)
            </p>
          </div>
        </div>
      </UCard>

      <h2 class="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
        4. Перечень обрабатываемых данных
      </h2>
      <ul
        class="list-disc pl-6 mb-10 space-y-2 text-neutral-700
          dark:text-neutral-300"
      >
        <li>Имя.</li>
        <li>Email.</li>
        <li>Телефон.</li>
        <li>Адрес доставки.</li>
        <li>Никнейм в мессенджере (VK / Telegram).</li>
      </ul>

      <UAccordion
        type="multiple"
        :items="accordionItems"
        class="mb-10"
      >
        <template #purpose>
          <ol class="list-decimal pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
            <li>Оформление и доставка заказов, оформленных через сайт.</li>
            <li>
              Обратная связь по заказам — уведомления в Telegram и по электронной
              почте.
            </li>
            <li>Приём оплаты через платёжную систему.</li>
            <li>
              Исполнение требований законодательства РФ: бухгалтерский и
              налоговый учёт, претензионная работа.
            </li>
          </ol>
        </template>

        <template #legal-basis>
          <div class="text-neutral-700 dark:text-neutral-300 space-y-3">
            <p>
              Правовым основанием обработки персональных данных является
              п. 1 ч. 1 ст. 6 Федерального закона от 27.07.2006 № 152-ФЗ
              «О персональных данных» — согласие субъекта персональных данных на
              обработку его персональных данных.
            </p>
            <p>
              Для специальных категорий ПДн (при наличии) — ст. 9 ФЗ-152
              (отдельное согласие в письменной форме). Сайт не запрашивает
              специальные категории ПДн и биометрические данные.
            </p>
            <p>
              Согласие предоставляется путём проставления отметки в чекбоксе при
              оформлении заказа.
            </p>
          </div>
        </template>

        <template #third-parties>
          <div class="overflow-x-auto">
            <table
              class="w-full text-sm text-left text-neutral-700
                dark:text-neutral-300"
            >
              <thead
                class="text-xs text-neutral-600 dark:text-neutral-400
                  uppercase border-b border-neutral-200 dark:border-neutral-700"
              >
                <tr>
                  <th class="py-3 pr-4">Третье лицо</th>
                  <th class="py-3 pr-4">Назначение</th>
                  <th class="py-3 pr-4">Страна</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-200 dark:divide-neutral-700">
                <tr>
                  <td class="py-3 pr-4 font-medium">Google Ireland Ltd</td>
                  <td class="py-3 pr-4">
                    Хранение заказов в Firebase Realtime Database,
                    аутентификация админки (Firebase Auth).
                  </td>
                  <td class="py-3 pr-4">Ирландия (ЕС). Серверы GCP: ЕС / США</td>
                </tr>
                <tr>
                  <td class="py-3 pr-4 font-medium">ООО «Дадата»</td>
                  <td class="py-3 pr-4">
                    Подсказки адресов при оформлении заказа.
                  </td>
                  <td class="py-3 pr-4">РФ</td>
                </tr>
                <tr>
                  <td class="py-3 pr-4 font-medium">Telegram Messenger LLP</td>
                  <td class="py-3 pr-4">
                    Уведомления продавцу о новом заказе.
                  </td>
                  <td class="py-3 pr-4">ОАЭ / международный сервис</td>
                </tr>
                <tr>
                  <td class="py-3 pr-4 font-medium">[email-провайдер]</td>
                  <td class="py-3 pr-4">
                    Уведомления покупателю о статусе заказа.
                  </td>
                  <td class="py-3 pr-4">
                    <UAlert
                      class="my-1"
                      icon="heroicons:exclamation-triangle"
                      color="warning"
                      variant="subtle"
                      title="Заполнить юристу"
                      description="Указать фактического email-провайдера (например, Yandex, Mail.ru, SendGrid, Firebase Cloud Functions + SMTP) и страну хранения."
                    />
                    <span>[используется провайдер X — уточнить]</span>
                  </td>
                </tr>
                <tr>
                  <td class="py-3 pr-4 font-medium">ООО НКО «ЮМани» (ЮKassa)</td>
                  <td class="py-3 pr-4">
                    Приём онлайн-платежей по заказам.
                  </td>
                  <td class="py-3 pr-4">РФ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <template #retention>
          <div class="space-y-4">
            <div class="overflow-x-auto">
              <table
                class="w-full text-sm text-left text-neutral-700
                  dark:text-neutral-300"
              >
                <thead
                  class="text-xs text-neutral-600 dark:text-neutral-400
                    uppercase border-b border-neutral-200
                    dark:border-neutral-700"
                >
                  <tr>
                    <th class="py-3 pr-4">Тип ПДн</th>
                    <th class="py-3 pr-4">Срок хранения</th>
                    <th class="py-3 pr-4">Основание</th>
                  </tr>
                </thead>
                <tbody
                  class="divide-y divide-neutral-200 dark:divide-neutral-700"
                >
                  <tr>
                    <td class="py-3 pr-4">
                      Данные заказов (имя, email, телефон, адрес)
                    </td>
                    <td class="py-3 pr-4">
                      1 год после доставки, затем анонимизация
                    </td>
                    <td class="py-3 pr-4">Исполнение договора</td>
                  </tr>
                  <tr>
                    <td class="py-3 pr-4">Бухгалтерские документы</td>
                    <td class="py-3 pr-4">
                      <UAlert
                        class="my-1"
                        icon="heroicons:exclamation-triangle"
                        color="warning"
                        variant="subtle"
                        title="Заполнить юристу"
                        description="Уточнить срок хранения бухгалтерских документов по ФЗ-54 / НК РФ (стандартно — 5 лет)."
                      />
                      <span>5 лет</span>
                    </td>
                    <td class="py-3 pr-4">ФЗ-54 / НК РФ</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3
              class="text-lg font-semibold text-neutral-900 dark:text-white
                mt-6"
            >
              Трансграничная передача данных
            </h3>
            <p class="text-neutral-700 dark:text-neutral-300">
              Часть обрабатываемых персональных данных хранится в Firebase
              (Google Ireland Ltd), серверы которой расположены в ЕС и США.
              Трансграничная передача данных осуществляется на основании
              отдельного согласия субъекта, предоставляемого при оформлении
              заказа.
            </p>
            <p class="text-neutral-700 dark:text-neutral-300">
              В случае изменения законодательства РФ, ограничивающего
              трансграничную передачу ПДн, Оператор обязуется мигрировать данные
              на серверы, расположенные на территории Российской Федерации, в
              разумный срок.
            </p>
          </div>
        </template>

        <template #subject-rights>
          <div class="text-neutral-700 dark:text-neutral-300 space-y-5">
            <div>
              <h4 class="font-semibold text-neutral-900 dark:text-white">
                Право на получение информации об обработке (ст. 14 ФЗ-152)
              </h4>
              <p>
                Субъект вправе запросить у Оператора информацию об обработке
                своих ПДн.
                <NuxtLink
                  to="/personal-data-request"
                  class="text-primary-500 hover:underline"
                >
                  Подать запрос
                </NuxtLink>.
              </p>
            </div>
            <div>
              <h4 class="font-semibold text-neutral-900 dark:text-white">
                Право на уточнение и удаление ПДн (ст. 21 ФЗ-152)
              </h4>
              <p>
                Субъект вправе требовать уточнения (обновления, исправления)
                или удаления своих ПДн.
                <NuxtLink
                  to="/personal-data-request"
                  class="text-primary-500 hover:underline"
                >
                  Подать запрос
                </NuxtLink>.
              </p>
            </div>
            <div>
              <h4 class="font-semibold text-neutral-900 dark:text-white">
                Право на обжалование в Роскомнадзоре
              </h4>
              <p>
                Субъект вправе обжаловать действия или бездействие Оператора в
                уполномоченный орган по защите прав субъектов ПДн —
                Федеральную службу по надзору в сфере связи, информационных
                технологий и массовых коммуникаций (Роскомнадзор).
              </p>
            </div>
            <div>
              <h4 class="font-semibold text-neutral-900 dark:text-white">
                Порядок отзыва согласия
              </h4>
              <p>
                Согласие на обработку персональных данных может быть отозвано в
                любой момент путём направления запроса на адрес электронной почты
                <a
                  href="mailto:kalashnikova199979@gmail.com"
                  class="text-primary-500 hover:underline"
                >
                  kalashnikova199979@gmail.com
                </a>. После получения отзыва Оператор прекращает обработку ПДн
                и уничтожает их в течение 30 (тридцати) календарных дней, за
                исключением данных, хранение которых предусмотрено требованиями
                законодательства.
              </p>
            </div>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              Срок ответа Оператора на запросы субъекта — 10 рабочих дней
              (ст. 21 ФЗ-152).
            </p>
          </div>
        </template>
      </UAccordion>

      <h2 class="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
        10. Реквизиты оператора и контакты для обращений
      </h2>
      <p class="text-neutral-700 dark:text-neutral-300 mb-2">
        По всем вопросам, связанным с обработкой персональных данных, субъект
        вправе обратиться к Оператору по адресу электронной почты
        <a
          href="mailto:kalashnikova199979@gmail.com"
          class="text-primary-500 hover:underline"
        >
          kalashnikova199979@gmail.com
        </a>. Указанный адрес электронной почты является основным и
        предпочтительным каналом обращений по вопросам обработки
        персональных данных. Полные реквизиты Оператора приведены в разделе 3
        настоящей Политики.
      </p>
      <ul
        class="list-none pl-0 mb-10 space-y-1 text-neutral-700
          dark:text-neutral-300 text-sm"
      >
        <li>
          <span class="text-neutral-500 dark:text-neutral-400">ФИО: </span>
          Капралова Юлия
        </li>
        <li>
          <span class="text-neutral-500 dark:text-neutral-400">Статус: </span>
          Самозанятая (НПД)
        </li>
        <li>
          <span class="text-neutral-500 dark:text-neutral-400">ИНН: </span>
          <span class="font-mono">370605819158</span>
        </li>
        <li>
          <span class="text-neutral-500 dark:text-neutral-400">
            Адрес обращений:
          </span>
          <a
            href="mailto:kalashnikova199979@gmail.com"
            class="text-primary-500 hover:underline"
          >
            kalashnikova199979@gmail.com
          </a>
        </li>
      </ul>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-10">
        Сайт использует Firebase Authentication для технической аутентификации
        администратора (хранение сессии в IndexedDB браузера); cookie-файлы
        маркетинговых и аналитических сервисов (Яндекс.Метрика, Google Analytics
        и т. п.) не применяются. Оператор вправе вносить изменения в настоящую
        Политику; новая редакция вступает в силу с момента её размещения на
        данной странице, дата обновления указана в начале документа.
      </p>

      <div class="text-center mt-12 mb-6">
        <UButton
          to="/"
          color="primary"
          variant="outline"
          icon="heroicons:arrow-left"
          label="Назад на главную"
        />
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
          © 2026 Калашникова Юлия · kalashyulya.ru
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { AccordionItem } from '@nuxt/ui'

  const accordionItems: AccordionItem[] = [
    {
      label: '5. Цели обработки персональных данных',
      icon: 'heroicons:target',
      slot: 'purpose',
    },
    {
      label: '6. Правовое основание обработки',
      icon: 'heroicons:scale',
      slot: 'legal-basis',
    },
    {
      label: '7. Передача ПДн третьим лицам',
      icon: 'heroicons:share',
      slot: 'third-parties',
    },
    {
      label: '8. Сроки обработки и хранения ПДн',
      icon: 'heroicons:clock',
      slot: 'retention',
    },
    {
      label: '9. Права субъекта и порядок отзыва согласия',
      icon: 'heroicons:user-circle',
      slot: 'subject-rights',
    },
  ]

  useSeo({
    title: 'Политика обработки персональных данных',
    description:
      'Политика обработки персональных данных интернет-магазина kalashyulya.ru. Цели, правовые основания, перечень ПДн, третьи лица, права субъекта и порядок отзыва согласия.',
    image: '/logo.png',
  })

  onMounted(() => {
    scrollTo(0, 0)
  })
</script>

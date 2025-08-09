<template>
  <div class="container relative">
    <svg
      width="1080"
      height="2596"
      viewBox="15 0 1050 2596"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="absolute top-10 left-1/2 transform -translate-x-1/2 z-[-1]
        will-change-[stroke-dashoffset] hidden lg:block"
    >
      <path
        id="scrollPath"
        d="M537.781 0C537.781 0 537.781 183.41 537.781 337.298C537.781 484.534 1017.23 370.584 1042.72 547.088C1062.49 684.017 -56.6296 976.133 7.74682 854.237C76 725 1040.88 942.271 995.572 1120.56C967.72 1230.15 40.727 1256.65 7.74682 1353.5C-67.7532 1575.22 831.625 1920.85 944.5 1708.5C1024.5 1558 20.7569 1766.12 31 1951C40.0865 2115 535.873 2014.51 537.781 2179.5V2596"
        stroke="#7FC4F8"
        stroke-width="5"
      />
    </svg>

    <div class="container flex flex-col gap-y-25 items-center">
      <div
        v-for="item in timelineText"
        :key="item.id"
        class="flex flex-col items-center lg:w-1/3 gap-y-4"
      >
        <NuxtImg
          :src="item.Image"
          class="size-42 object-cover rounded-2xl border-5 border-info-400
            shadow-md dark:shadow-none"
        />
        <div
          class="flex flex-col items-center p-2 rounded-xl gap-y-2
            dark:bg-neutral-900 bg-white"
        >
          <h3 class="font-bold text-lg">
            {{ item.year }}
          </h3>
          <p class="text-sm">{{ item.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    cleanupScrollAnimation,
    setupScrollAnimation,
  } from '~/helpers/scrollAnimation'

  const timelineText = [
    {
      id: 1,
      year: '1999',
      text: 'Я родилась в маленьком городке Южа Ивановской области. С самого детства меня тянуло к рисованию.',
      Image: 'timeline/1.webp',
    },
    {
      id: 2,
      year: '2013',
      text: 'В 14 лет состоялась моя первая персональная выставка — это было в художественной школе в Юже. Очень волнительно!',
      Image: 'timeline/2.webp',
    },
    {
      id: 3,
      year: '2014-2018',
      text: 'Я поступила в Палехское художественное училище. Училась на художника-мастера, осваивала лаковую миниатюру и иконопись. За эти годы случилось много важного: В 2017 году сделала выставку своих акварелей и набросков в училище — назвала её «Радость творчества». В том же году неожиданно выиграла гран-при на конкурсе в Суриковском институте в Москве. После окончания училища какое-то время работала в мастерской, писала лаковые миниатюры.',
      Image: 'timeline/3.webp',
    },
    {
      id: 4,
      year: '2019',
      text: 'Решила круто изменить жизнь — переехала в Петербург! Стала ходить на вечерние курсы при Академии Художеств, брала мастер-классы у разных художников-акварелистов.',
      Image: 'timeline/4.webp',
    },
    {
      id: 5,
      year: '2018-2024',
      text: 'Выставки стали частью моей жизни: Провела несколько персональных выставок — в Юже, Шуе и Петербурге. Участвовала в куче коллективных выставок по всей России — больше 25!',
      Image: 'timeline/5.webp',
    },
    {
      id: 6,
      year: '2022-2024',
      text: 'Начала преподавать: Сначала просто мастер-классы по акварели. Потом стала вести занятия в онлайн-школах. Полюбила выезжать с учениками на пленэры по Петербургу. Из ярких событий: В 2024 году мои работы попали в Третьяковку — участвовала в выставке «Искусство труда». В том же году мои акварели отправились в Новосибирск на выставку «Вокруг света».',
      Image: 'timeline/6.webp',
    },
    {
      id: 7,
      year: '2025',
      text: 'Этот год начался круто: Заняла первое место на фестивале акварели в Ижевске. Провела необычный эксперимент — арт-йога тур на Алтае. Набрала группу «нерисующих» студентов — учимся видеть мир через творчество. Кажется, самое интересное ещё впереди!',
      Image: 'timeline/7.webp',
    },
  ]

  onMounted(() => {
    setupScrollAnimation('#scrollPath')
  })

  onBeforeUnmount(() => {
    cleanupScrollAnimation()
  })
</script>

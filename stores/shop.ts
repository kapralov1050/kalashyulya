import type { Product } from '~/types'

export const useShopStore = defineStore('shop', () => {
  const products = ref<Product[]>([
    {
      id: 1,
      title: 'Рассвет в горах',
      description:
        'Картина маслом, изображающая первые лучи солнца на горных вершинах.',
      price: 4500,
      category: 'Живопись',
      image: '/gallery/2.jpg',
      stock: 3,
    },
    {
      id: 2,
      title: 'Танцующие тени',
      description: 'Абстрактная акварель с игрой света и тени.',
      price: 3200,
      category: 'Графика',
      image: '/gallery/3.jpg',
      stock: 1,
    },
    {
      id: 3,
      title: 'Старый город',
      description: 'Улицы европейского города в технике пастели.',
      price: 5100,
      category: 'Живопись',
      image: '/gallery/4.jpg',
      stock: 4,
    },
    {
      id: 4,
      title: 'Морская симфония',
      description: 'Масляная живопись с волнами и чайками.',
      price: 4800,
      category: 'Живопись',
      image: '/gallery/5.jpg',
      stock: 5,
    },
    {
      id: 5,
      title: 'Портрет незнакомки',
      description: 'Графитный карандаш, детальная проработка черт лица.',
      price: 2900,
      category: 'Портреты',
      image: '/gallery/6.jpg',
      stock: 5,
    },
    {
      id: 6,
      title: 'Осенний вальс',
      description: 'Яркие краски осени в смешанной технике.',
      price: 3700,
      category: 'Живопись',
      image: '/gallery/7.jpg',
      stock: 5,
    },
    {
      id: 7,
      title: 'Кот ученый',
      description: 'Забавная иллюстрация кота с книгой, акрил.',
      price: 2300,
      category: 'Иллюстрации',
      image: '/gallery/8.jpg',
      stock: 5,
    },
    {
      id: 8,
      title: 'Лунная соната',
      description: 'Ночной пейзаж с лунной дорожкой на воде.',
      price: 4200,
      category: 'Живопись',
      image: '/gallery/9.jpg',
      stock: 5,
    },
    {
      id: 9,
      title: 'Весенние грезы',
      description: 'Нежные цветы в технике импасто.',
      price: 3900,
      category: 'Живопись',
      image: '/gallery/10.jpg',
      stock: 5,
    },
    {
      id: 10,
      title: 'Уличный музыкант',
      description: 'Динамичный скетч тушью.',
      price: 1800,
      category: 'Графика',
      image: '/gallery/11.jpg',
      stock: 5,
    },
    {
      id: 11,
      title: 'Тишина',
      description: 'Минималистичный зимний пейзаж.',
      price: 4100,
      category: 'Живопись',
      image: '/gallery/12.jpg',
      stock: 5,
    },
    {
      id: 12,
      title: 'Сказочный лес',
      description: 'Иллюстрация в стиле фэнтези, цифровая живопись.',
      price: 3500,
      category: 'Иллюстрации',
      image: '/gallery/13.jpg',
      stock: 5,
    },
    {
      id: 13,
      title: 'Кофейный натюрморт',
      description: 'Аромат кофе, написанный акриловыми красками.',
      price: 2700,
      category: 'Натюрморты',
      image: '/gallery/14.jpg',
      stock: 5,
    },
    {
      id: 14,
      title: 'Бесконечность',
      description: 'Абстракция с глубоким смыслом, масло.',
      price: 5200,
      category: 'Живопись',
      image: '/gallery/15.jpg',
      stock: 5,
    },
  ])

  const searchedProducts = ref<Product[]>([])

  const searchProducts = (title: string) => {
    if (!title.trim()) searchedProducts.value = products.value

    searchedProducts.value = products.value.filter(item =>
      item.title.toLowerCase().includes(title.toLowerCase()),
    )
  }

  return {
    searchedProducts,
    products,
    searchProducts,
  }
})

export const FRAMING_OPTIONS = [
  {
    value: 'none' as const,
    title: 'Без рамки',
    description: 'Работа без дополнительного оформления',
    icon: 'heroicons:x-mark',
    price: null as number | null,
  },
  {
    value: 'simple' as const,
    title: 'Рама с паспарту',
    description: 'Классическая рама с белым паспарту',
    icon: 'heroicons:square-2-stack',
    price: 2000,
  },
  {
    value: 'premium' as const,
    title: 'Багет с паспарту',
    description: 'Профессиональный багет с паспарту',
    icon: 'heroicons:sparkles',
    price: 5000,
  },
]

export const FRAMING_IMAGES: Record<string, string> = {
  '': '/product-design/без_оформления.png',
  none: '/product-design/без_оформления.png',
  simple: '/product-design/в_раме_с_паспарту.png',
  premium: '/product-design/в_багете_с_паспарту.png',
}

export const FRAMING_ALTS: Record<string, string> = {
  '': 'Без оформления',
  none: 'Без оформления',
  simple: 'Рама с паспарту',
  premium: 'Багет с паспарту',
}

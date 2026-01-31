# AR (Augmented Reality) просмотр картин

## Обзор

Проект поддерживает просмотр картин в AR пространстве с помощью компонента `ARButton` и библиотеки `@google/model-viewer`.

## Поддерживаемые платформы

- **iOS 12+**: AR Quick Look (.usdz файлы)
- **Android**: Google Scene Viewer / WebXR (.glb файлы)
- **Chrome Desktop**: WebXR Device API

## Использование

### В компонентах

```vue
<template>
  <ARButton
    :ar-model="product.arModel"
    :image="product.image[0]"
    :size="product.size"
    :alt="product.title"
    color="neutral"
  />
</template>
```

### Пропсы ARButton

| Проп | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `arModel` | `string` | Нет* | URL к AR модели (.glb или .usdz) |
| `image` | `string` | Нет | URL изображения (резерв) |
| `size` | `string` | Нет | Размер в формате "30x40" |
| `alt` | `string` | Нет | Alt текст для изображения |
| `color` | `string` | Нет | Цвет кнопки (по умолчанию "neutral") |

*Для работы AR обязательна хотя бы одна AR модель

## Подготовка AR моделей

### Вариант 1: Онлайн сервисы конвертации

Для конвертации 2D изображений в 3D модели можно использовать:

- [Sketchfab](https://sketchfab.com/) - загрузка изображений как 3D моделей
- [Adobe Aero](https://www.adobe.com/ru/products/aero.html) - создание AR контента
- [Spline](https://spline.design/) - создание 3D для web
- [Blender](https://www.blender.org/) - бесплатная 3D программа

### Вариант 2: Ручное создание в Blender

1. Откройте Blender
2. Создайте плоскость (Plane) с размерами из `product.size`
3. Добавьте текстуру из изображения
4. Экспортируйте в формат `.glb` (для Android/Web) или `.usdz` (для iOS)

### Вариант 3: API конвертации (рекомендуется для продакшна)

Используйте API сервисы для автоматической конвертации:

```typescript
// Пример использования в компоненте
const arModelUrl = await convertImageToAR(imageUrl, {
  width: 30,
  height: 40,
  format: 'glb' // или 'usdz' для iOS
})
```

## Добавление AR модели в продукт

### В данных продукта:

```typescript
const product: Product = {
  title: 'Название картины',
  image: ['https://example.com/image.jpg'],
  size: '30x40',
  arModel: 'https://example.com/models/painting.glb', // Добавьте это поле
  // ... остальные поля
}
```

### В Firebase / базе данных:

Добавьте поле `arModel` к каждому продукту, для которого нужен AR просмотр.

## Форматы AR моделей

| Платформа | Рекомендуемый формат |
|-----------|---------------------|
| Android / WebXR | `.glb` (GL Binary) |
| iOS | `.usdz` (USD Universal Scene Description) |
| Universal | `.gltf` (GL Transmission Format) |

## Composable `useAR`

Дополнительные функции для работы с AR:

```typescript
const { isARSupported, checkARSupport, parseSize } = useAR()

// Проверка поддержки AR
const supported = await checkARSupport()

// Парсинг размера из строки
const size = parseSize('30x40')
// { width: 30, height: 40 }
```

## Тестирование

### На устройстве Android:
1. Откройте страницу с продуктом
2. Нажмите кнопку "Посмотреть в AR"
3. Откроется Google Scene Viewer

### На устройстве iOS:
1. Откройте страницу с продуктом
2. Нажмите кнопку "Посмотреть в AR"
3. Откроется AR Quick Look

### В Chrome Desktop:
1. Включите WebXR флаг: `chrome://flags/#enable-webxr`
2. Откройте страницу с продуктом
3. Нажмите кнопку "Посмотреть в AR"
4. Подключите VR/AR шлем или используйте эмуляцию

## Устранение проблем

### Кнопка "AR недоступно"
- Убедитесь, что используете поддерживаемое устройство (iOS 12+ или Android)
- Проверьте, что поле `arModel` содержит корректный URL

### Модель не загружается
- Проверьте, что URL доступен (CORS настроен правильно)
- Убедитесь, что формат модели соответствует платформе (.glb для Android)
- Проверьте размер файла (рекомендуется до 10MB)

### Модель отображается неправильно
- Проверьте масштаб модели в Blender при экспорте
- Убедитесь, что используете метрическую систему (миллиметры/сантиметры)

## Следующие шаги

1. Подготовьте GLB модели для продуктов
2. Добавьте URL моделей в данные продуктов
3. Протестируйте на реальных устройствах
4. Рассмотрите возможность автоматической конвертации изображений в GLB

## Полезные ссылки

- [model-viewer документация](https://modelviewer.dev/)
- [WebXR спецификация](https://immersive-web.github.io/webxr/)
- [AR Quick Look программирование](https://developer.apple.com/augmented-reality/quick-look/)
- [Google AR Core](https://developers.google.com/ar/reference/c/group/ar-camera)

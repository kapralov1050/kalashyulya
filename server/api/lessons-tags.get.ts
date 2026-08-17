/**
 * GET /api/lessons-tags
 *
 * Возвращает теги уроков (для плейлистов и страниц тегов).
 * Сейчас Firebase был единственным источником тегов; в новой схеме они
 * будут привязаны к курсам (когда появится модуль уроков).
 *
 * Возвращаем [] чтобы фронт работал без 404; добавим реальные данные
 * когда подключим модуль уроков.
 */

export interface LessonTagDto {
  id: string
  title: string
}

export default defineEventHandler((): LessonTagDto[] => {
  return []
})
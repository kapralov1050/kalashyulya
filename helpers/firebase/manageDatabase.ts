import type { DatabaseReference, DataSnapshot } from 'firebase/database'
import { get, ref as dbRef, set, remove, update, push } from 'firebase/database'

export const getDataByPath = async <T>(
  path: string,
  defaultValue: T | null = null,
): Promise<T | null> => {
  try {
    const reference: DatabaseReference = dbRef(useDatabase(), path)
    const snapshot: DataSnapshot = await get(reference)

    return snapshot.exists() ? (snapshot.val() as T) : defaultValue
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const setDataByPath = async <T>(
  data: T,
  path: string,
): Promise<void> => {
  try {
    const reference: DatabaseReference = dbRef(useDatabase(), path)
    await set(reference, data)
  } catch (error) {
    console.log('error while setting data:', error)
    throw error
  }
}

export const removeDataByPath = async (path: string): Promise<void> => {
  try {
    const reference: DatabaseReference = dbRef(useDatabase(), path)
    await remove(reference)
  } catch (error) {
    console.log('error while removing data:', error)
    throw error
  }
}

export const updateDataByPath = async <T>(
  data: T,
  path: string,
): Promise<void> => {
  try {
    const itemsRef = dbRef(useDatabase(), path)
    const snapshot = await get(itemsRef)
    const items = snapshot.val() || []

    // Находим максимальный id
    const maxId = Object.keys(items)
      .map(prod => +prod.split('_')[1])
      .reduce((a, b) => Math.max(a, b), 0)
    // Добавляем новый товар
    const newItemWithId = { ...data, id: maxId + 1 }
    const updates: Record<string, T> = {}
    updates[`${path}/product_${maxId + 1}`] = newItemWithId

    update(dbRef(useDatabase()), updates)
  } catch (error) {
    console.log('error while updating data:', error)
    throw error
  }
}

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

export const updateDataByPath = async (
  updates: object,
  path: string,
): Promise<void> => {
  try {
    const updatesRef = dbRef(useDatabase(), path)
    update(updatesRef, updates)
  } catch (error) {
    console.log('error while updating data:', error)
    throw error
  }
}

export const getSnapshotByPath = async (
  path: string,
): Promise<DataSnapshot> => {
  try {
    const itemsRef = dbRef(useDatabase(), path)
    const snapshot = await get(itemsRef)
    return snapshot.val() || []
  } catch (error) {
    console.log('error while getting snapshot:', error)
    throw error
  }
}

export const pushDataByPath = async <T>(data: T, path: string) => {
  try {
    const dataRef = dbRef(useDatabase(), path)
    const newRef = push(dataRef)

    await set(newRef, data)
  } catch (error) {
    console.error(`Error pushing data to ${path}:`, error)
    return { id: null, error }
  }
}

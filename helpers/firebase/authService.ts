import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { updateDataByPath } from './manageDatabase'

export const createUser = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      getAuth(),
      email,
      password,
    )

    const userData = {
      name,
      email: userCredential.user.email,
      role: 'user',
    }

    await updateDataByPath(userData, `users/${userCredential.user.uid}`)

    return { user: userData, error: null }
  } catch (error) {
    let errorMessage = ''

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email'
          break
        case 'auth/weak-password':
          errorMessage = 'Weak password'
          break
        default:
          errorMessage = 'An error occurred'
          break
      }
    }

    return { user: null, error: errorMessage }
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      getAuth(),
      email,
      password,
    )
    return { user: userCredential.user, error: null }
  } catch (error) {
    let errorMessage = ''

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email'
          break
        case 'auth/user-not-found':
          errorMessage = 'User not found'
          break
        case 'auth/wrong-password':
          errorMessage = 'Wrong password'
          break
        default:
          errorMessage = 'Email or password is incorrect'
          break
      }
    }

    return { user: null, error: errorMessage }
  }
}

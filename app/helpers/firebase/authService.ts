import { FirebaseError } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

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
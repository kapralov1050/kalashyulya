import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

const MOTION_EASES = {
  'ease-out-strong': '0.23,1,0.32,1',
  'ease-in-out-strong': '0.77,0,0.175,1',
} as const

export type MotionEase = keyof typeof MOTION_EASES

export function registerMotionEases() {
  gsap.registerPlugin(CustomEase)
  for (const [name, curve] of Object.entries(MOTION_EASES)) {
    CustomEase.create(name, curve)
  }
}

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

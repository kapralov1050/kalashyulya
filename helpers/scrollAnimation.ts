import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const setupScrollAnimation = (element: string) => {
  const path = document.querySelector(element) as SVGPathElement | null

  if (!path) return

  gsap.set(path, { transformOrigin: '50% 50%' })
  gsap.set(path, {
    strokeDasharray: path.getTotalLength(),
    strokeDashoffset: path.getTotalLength(),
  })

  const animation = gsap.to(path, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: path,
      start: 'top center',
      end: 'bottom bottom',
      scrub: 1.1,
    },
  })

  return {
    cleanup: () => {
      animation?.scrollTrigger?.kill()
      animation?.kill()
    },
  }
}

export const cleanupScrollAnimation = (element: string) => {
  const path = document.querySelector(element) as SVGPathElement | null
  if (!path) return

  ScrollTrigger.getAll().forEach(st => {
    if (st.trigger === path) {
      st.kill()
    }
  })
}

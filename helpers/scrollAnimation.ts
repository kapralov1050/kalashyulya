import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(MotionPathPlugin)

export const setupScrollAnimation = (element: string) => {
  const path = document.querySelector(element) as SVGPathElement | null
  const icon = document.querySelector('.timeline-icon') as SVGGElement | null

  if (!path) return

  gsap.set(path, { transformOrigin: '50% 50%' })
  gsap.set(path, {
    strokeDasharray: path.getTotalLength(),
    strokeDashoffset: path.getTotalLength(),
  })

  if (icon) {
    gsap.set(icon, {
      transformOrigin: '50% 50%',
      xPercent: -50,
      yPercent: -50,
    })
  }

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

  if (icon) {
    gsap.to(icon, {
      motionPath: {
        path: element,
        align: element,
        alignOrigin: [0.5, 0.5],
        autoRotate: true,
      },
      ease: 'none',
      scrollTrigger: {
        trigger: path,
        start: 'top center',
        end: 'bottom bottom',
        scrub: 1.1,
      },
    })
  }

  return {
    cleanup: () => {
      animation?.scrollTrigger?.kill()
      animation?.kill()
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === path) {
          trigger.kill()
        }
      })
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

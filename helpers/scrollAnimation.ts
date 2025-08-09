import type { DebouncedFuncLeading } from 'lodash'
import { throttle } from 'lodash-es'

let scrollHandler: DebouncedFuncLeading<() => void> | null = null
let path: SVGPathElement | null = null

export const setupScrollAnimation = (element: string) => {
  path = document.querySelector(element)
  if (!path) return

  const pathLength = path.getTotalLength()
  path.style.strokeDasharray = String(pathLength)
  path.style.strokeDashoffset = String(pathLength)

  scrollHandler = throttle(() => {
    const scrollPercentage =
      (document.documentElement.scrollTop * 2 + document.body.scrollTop) /
      (document.documentElement.scrollHeight -
        document.documentElement.clientHeight)

    const drawLength = pathLength * scrollPercentage

    if (!path) return
    path.style.strokeDashoffset = String(-drawLength - 2000)
  }, 18)

  window.addEventListener('scroll', scrollHandler)
}

export const cleanupScrollAnimation = () => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
    scrollHandler = null
  }
  if (path) {
    path.style.willChange = 'auto'
    path.style.strokeDasharray = ''
    path.style.strokeDashoffset = ''
    path = null
  }
}

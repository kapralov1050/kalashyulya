import gsap from 'gsap'

export function useTimelineAnimation(selector = '.timelineItem') {
  const animate = () => {
    const items: Element[] = gsap.utils.toArray(selector)
    items.forEach(item => {
      gsap.from(item, {
        x: 100,
        opacity: 0,
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',
          end: '+=600',
          scrub: true,
        },
      })
    })
  }
  return { animate }
}

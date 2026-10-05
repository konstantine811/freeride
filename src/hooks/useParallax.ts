import { useEffect, useRef } from 'react'

/** Gives the background and hero copy different scroll speeds. */
export function useParallax(origin: 'top' | 'center' = 'center') {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = window.matchMedia('(max-width: 800px)')
    let frame: number | null = null

    const update = () => {
      frame = null
      if (reducedMotion.matches) {
        element.style.setProperty('--parallax-y', '0px')
        element.style.setProperty('--parallax-content-y', '0px')
        element.style.setProperty('--depth-far-y', '0px')
        element.style.setProperty('--depth-rider-y', '0px')
        element.style.setProperty('--depth-snow-y', '0px')
        return
      }

      const rect = element.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return

      const distance = origin === 'top'
        ? -rect.top
        : window.innerHeight / 2 - rect.top - rect.height / 2
      const speed = mobile.matches ? 0.16 : 0.42
      const limit = mobile.matches ? 64 : 144
      // Keep the movement inside the extra background area to avoid exposed edges.
      const offset = limit * Math.tanh(distance * speed / limit)
      element.style.setProperty('--parallax-y', `${offset}px`)
      const contentOffset = origin === 'top' && !mobile.matches
        ? 48 * Math.tanh(distance * 0.1 / 48)
        : 0
      element.style.setProperty('--parallax-content-y', `${contentOffset}px`)
      if (origin === 'top') {
        const travel = Math.max(0, distance)
        const strength = mobile.matches ? 0.45 : 1
        element.style.setProperty('--depth-far-y', `${140 * Math.tanh(travel * 0.5 / 140) * strength}px`)
        element.style.setProperty('--depth-rider-y', `${65 * Math.tanh(travel * 0.16 / 65) * strength}px`)
        element.style.setProperty('--depth-snow-y', `${-45 * Math.tanh(travel * 0.2 / 45) * strength}px`)
      }
    }

    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(update)
    }

    const resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(element)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    reducedMotion.addEventListener('change', schedule)
    mobile.addEventListener('change', schedule)
    update()

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      reducedMotion.removeEventListener('change', schedule)
      mobile.removeEventListener('change', schedule)
      element.style.removeProperty('--parallax-y')
      element.style.removeProperty('--parallax-content-y')
      element.style.removeProperty('--depth-far-y')
      element.style.removeProperty('--depth-rider-y')
      element.style.removeProperty('--depth-snow-y')
    }
  }, [origin])

  return ref
}

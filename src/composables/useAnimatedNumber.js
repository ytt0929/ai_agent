import { ref } from 'vue'

export function useAnimatedNumber(target, duration = 1200) {
  const value = ref(0)

  function start() {
    const startTime = performance.now()
    const startVal = 0

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      value.value = Math.round(startVal + (target - startVal) * eased)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }

  return { value, start }
}

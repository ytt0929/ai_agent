<template>
  <span>{{ displayValue }}</span>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  target: { type: Number, default: 0 },
  duration: { type: Number, default: 1200 },
})

const displayValue = ref(0)

function animate() {
  const startTime = performance.now()
  const endVal = props.target

  function tick(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    displayValue.value = Math.round(endVal * eased)
    if (progress < 1) requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

onMounted(animate)
watch(() => props.target, animate)
</script>

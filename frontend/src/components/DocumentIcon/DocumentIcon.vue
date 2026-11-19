<script setup>
defineProps({ variant: { type: String, default: 'excel' } })
</script>

<template>
  <span class="file-icon" :class="`file-icon--${variant}`" aria-hidden="true"></span>
</template>

<style scoped>
.file-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  color: #27704f;
  background: #e2f1e8;
}

.file-icon::after {
  content: '';
  width: 0.75rem;
  height: 0.75rem;
  border: 1px solid currentColor;
  border-radius: 1px;
  background:
    linear-gradient(currentColor, currentColor) center / 1px 100% no-repeat,
    linear-gradient(currentColor, currentColor) center / 100% 1px no-repeat;
}

.file-icon--brand {
  background: #24704d;
  color: #fff;
  width: 2rem;
  height: 2rem;
}
.file-icon--heading,
.file-icon--word {
  width: 2.5rem;
  height: 2.5rem;
}
.file-icon--heading::after,
.file-icon--word::after {
  width: 0.95rem;
  height: 0.95rem;
}
.file-icon--word {
  color: #475e92;
  background: #e9eef8;
}
.file-icon--word::after {
  height: 1.15rem;
  background: repeating-linear-gradient(to bottom, transparent 0 3px, currentColor 3px 4px) center /
    65% 75% no-repeat;
}
</style>

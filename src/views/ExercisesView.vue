<script setup>
import { ref, computed } from 'vue'
import { useLog } from '../composables/useLog'
import Modal from '../components/Modal.vue'
import ExerciseDetail from '../components/ExerciseDetail.vue'

const { strengthGroups } = useLog()

const exercises = computed(() => {
  const map = new Map()
  for (const g of strengthGroups.value) {
    if (!map.has(g.exercise)) {
      map.set(g.exercise, { name: g.exercise, dates: new Set(), maxWeight: 0, lastDate: '' })
    }
    const e = map.get(g.exercise)
    e.dates.add(g.date)
    for (const s of g.sets) if ((Number(s.weight) || 0) > e.maxWeight) e.maxWeight = Number(s.weight) || 0
    if (g.date > e.lastDate) e.lastDate = g.date
  }
  return [...map.values()]
    .map((e) => ({ ...e, days: e.dates.size }))
    .sort((a, b) => b.days - a.days || (a.lastDate < b.lastDate ? 1 : -1))
})

const selected = ref(null)
</script>

<template>
  <div class="card">
    <h2>動作頻率</h2>
    <p v-if="!exercises.length" class="muted" style="margin-top: 12px">
      還沒有重訓紀錄。到「日曆」頁面點某天，新增第一個動作吧！
    </p>

    <button v-for="e in exercises" :key="e.name" class="ex-row" @click="selected = e.name">
      <div class="ex-left">
        <div class="ex-name">{{ e.name }}</div>
        <div class="ex-meta">最佳 {{ e.maxWeight }}kg · 最近 {{ e.lastDate.slice(5) }}</div>
      </div>
      <div class="ex-right">
        <span class="ex-count">{{ e.days }}</span>
        <span class="ex-unit">次</span>
        <span class="chev">›</span>
      </div>
    </button>
  </div>

  <Modal :show="!!selected" @close="selected = null">
    <ExerciseDetail v-if="selected" :name="selected" @close="selected = null" />
  </Modal>
</template>

<style scoped>
.ex-row {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  background: #fff; border: none; border-top: 1px solid #f3edfb;
  padding: 14px 2px; cursor: pointer; text-align: left;
}
.ex-row:first-of-type { border-top: none; }
.ex-name { font-weight: 600; font-size: 0.98rem; color: #3b2f4a; }
.ex-meta { font-size: 0.8rem; color: #8b7aa3; margin-top: 2px; }
.ex-right { display: flex; align-items: baseline; gap: 3px; color: #a855f7; }
.ex-count { font-size: 1.3rem; font-weight: 700; }
.ex-unit { font-size: 0.75rem; }
.chev { color: #c4b5d6; font-size: 1.2rem; margin-left: 6px; }
</style>

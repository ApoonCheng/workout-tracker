<script setup>
import { computed } from 'vue'
import { useLog } from '../composables/useLog'
import { toDateStr, todayStr } from '../lib/date'

const { strengthGroups, strengthSets, cardio } = useLog()

const trainedDates = computed(() => {
  const s = new Set()
  strengthGroups.value.forEach((g) => s.add(g.date))
  cardio.value.forEach((c) => s.add(c.date))
  return s
})

const streak = computed(() => {
  const dates = trainedDates.value
  let s = 0
  const cursor = new Date()
  if (!dates.has(todayStr())) cursor.setDate(cursor.getDate() - 1)
  while (dates.has(toDateStr(cursor))) {
    s++
    cursor.setDate(cursor.getDate() - 1)
  }
  return s
})

const thisWeekDays = computed(() => {
  const since = new Date()
  since.setDate(since.getDate() - 6)
  const sinceStr = toDateStr(since)
  return [...trainedDates.value].filter((d) => d >= sinceStr).length
})

const totalSessions = computed(() => strengthGroups.value.length)
const totalVolume = computed(() =>
  strengthSets.value.reduce((s, r) => s + (Number(r.weight) || 0) * (Number(r.reps) || 0), 0)
)
const cardioCount = computed(() => cardio.value.length)

const topExercises = computed(() => {
  const map = {}
  for (const g of strengthGroups.value) {
    map[g.exercise] = map[g.exercise] || new Set()
    map[g.exercise].add(g.date)
  }
  const arr = Object.entries(map).map(([name, set]) => ({ name, days: set.size }))
  const max = Math.max(1, ...arr.map((a) => a.days))
  return arr
    .sort((a, b) => b.days - a.days)
    .slice(0, 5)
    .map((a) => ({ ...a, pct: Math.round((a.days / max) * 100) }))
})
</script>

<template>
  <div class="hero card">
    <div class="hero-top">
      <div>
        <div class="hero-label">連續訓練</div>
        <div class="hero-streak">{{ streak }} <span>天</span></div>
      </div>
      <div class="hero-flame">🔥</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat card">
      <div class="stat-num">{{ thisWeekDays }}</div>
      <div class="stat-label">本週訓練天</div>
    </div>
    <div class="stat card">
      <div class="stat-num">{{ totalSessions }}</div>
      <div class="stat-label">重訓組合數</div>
    </div>
    <div class="stat card">
      <div class="stat-num">{{ Math.round(totalVolume).toLocaleString() }}</div>
      <div class="stat-label">總訓練量(kg)</div>
    </div>
    <div class="stat card">
      <div class="stat-num">{{ cardioCount }}</div>
      <div class="stat-label">有氧次數</div>
    </div>
  </div>

  <div class="card">
    <h2>最常練的動作</h2>
    <p v-if="!topExercises.length" class="muted">還沒有重訓紀錄。</p>
    <div v-for="t in topExercises" :key="t.name" class="type-row">
      <span class="type-name">{{ t.name }}</span>
      <div class="type-track"><div class="type-fill" :style="{ width: t.pct + '%' }"></div></div>
      <span class="type-count">{{ t.days }}</span>
    </div>
  </div>
</template>

<style scoped>
.hero { background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff; box-shadow: 0 6px 18px rgba(168, 85, 247, 0.3); }
.hero-top { display: flex; align-items: center; justify-content: space-between; }
.hero-label { font-size: 0.85rem; opacity: 0.9; }
.hero-streak { font-size: 2.4rem; font-weight: 800; line-height: 1.1; }
.hero-streak span { font-size: 1rem; font-weight: 500; }
.hero-flame { font-size: 2.4rem; }

.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.stat { text-align: center; padding: 16px 8px; margin-bottom: 16px; }
.stat-num { font-size: 1.6rem; font-weight: 700; color: #a855f7; }
.stat-label { font-size: 0.76rem; color: #8b7aa3; margin-top: 2px; }

.type-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.type-name { width: 64px; font-size: 0.88rem; }
.type-track { flex: 1; background: #f3e8ff; border-radius: 6px; height: 14px; overflow: hidden; }
.type-fill { height: 100%; background: linear-gradient(90deg, #a855f7, #ec4899); border-radius: 6px; }
.type-count { width: 24px; text-align: right; font-size: 0.85rem; color: #8b7aa3; }
</style>

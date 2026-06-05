<script setup>
import { ref, computed } from 'vue'
import { useWorkouts } from '../composables/useWorkouts'
import { toDateStr, todayStr } from '../lib/date'

const { workouts } = useWorkouts()

const period = ref('month')
const periods = [
  { key: 'all', label: '全部' },
  { key: 'month', label: '本月' },
  { key: 'week', label: '本週' },
]

const filtered = computed(() => {
  if (period.value === 'all') return workouts.value
  if (period.value === 'month') {
    const now = new Date()
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return workouts.value.filter((w) => w.date.startsWith(prefix))
  }
  const since = new Date()
  since.setDate(since.getDate() - 6)
  const sinceStr = toDateStr(since)
  return workouts.value.filter((w) => w.date >= sinceStr)
})

const count = computed(() => filtered.value.length)
const minutes = computed(() => filtered.value.reduce((s, w) => s + (w.duration || 0), 0))
const distance = computed(
  () => Math.round(filtered.value.reduce((s, w) => s + (Number(w.distance) || 0), 0) * 10) / 10
)
const activeDays = computed(() => new Set(filtered.value.map((w) => w.date)).size)

const streak = computed(() => {
  const dates = new Set(workouts.value.map((w) => w.date))
  let s = 0
  const cursor = new Date()
  if (!dates.has(todayStr())) cursor.setDate(cursor.getDate() - 1)
  while (dates.has(toDateStr(cursor))) {
    s++
    cursor.setDate(cursor.getDate() - 1)
  }
  return s
})

const minutesByDate = computed(() => {
  const map = {}
  for (const w of workouts.value) map[w.date] = (map[w.date] || 0) + (w.duration || 0)
  return map
})

const last7Days = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = toDateStr(d)
    days.push({ key, label: `${d.getMonth() + 1}/${d.getDate()}`, minutes: minutesByDate.value[key] || 0 })
  }
  const max = Math.max(1, ...days.map((d) => d.minutes))
  return days.map((d) => ({ ...d, pct: Math.round((d.minutes / max) * 100) }))
})

const byType = computed(() => {
  const map = {}
  for (const w of filtered.value) map[w.type] = (map[w.type] || 0) + 1
  const max = Math.max(1, ...Object.values(map))
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([type, c]) => ({ type, count: c, pct: Math.round((c / max) * 100) }))
})
</script>

<template>
  <div class="hero card">
    <div class="hero-top">
      <div>
        <div class="hero-label">連續運動</div>
        <div class="hero-streak">{{ streak }} <span>天</span></div>
      </div>
      <div class="hero-flame">🔥</div>
    </div>
  </div>

  <div class="toggle">
    <button
      v-for="p in periods"
      :key="p.key"
      :class="{ active: period === p.key }"
      @click="period = p.key"
    >
      {{ p.label }}
    </button>
  </div>

  <div class="stats">
    <div class="stat card">
      <div class="stat-num">{{ count }}</div>
      <div class="stat-label">次數</div>
    </div>
    <div class="stat card">
      <div class="stat-num">{{ minutes }}</div>
      <div class="stat-label">分鐘</div>
    </div>
    <div class="stat card">
      <div class="stat-num">{{ distance }}</div>
      <div class="stat-label">公里</div>
    </div>
    <div class="stat card">
      <div class="stat-num">{{ activeDays }}</div>
      <div class="stat-label">運動天數</div>
    </div>
  </div>

  <div class="card">
    <h2>最近 7 天（分鐘）</h2>
    <div class="bars">
      <div v-for="d in last7Days" :key="d.key" class="bar-col">
        <div class="bar-track">
          <div class="bar-fill" :style="{ height: d.pct + '%' }">
            <span v-if="d.minutes" class="bar-val">{{ d.minutes }}</span>
          </div>
        </div>
        <div class="bar-label">{{ d.label }}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>運動類型分布（{{ periods.find((p) => p.key === period).label }}）</h2>
    <p v-if="!byType.length" class="muted">這個期間還沒有紀錄。</p>
    <div v-for="t in byType" :key="t.type" class="type-row">
      <span class="type-name">{{ t.type }}</span>
      <div class="type-track"><div class="type-fill" :style="{ width: t.pct + '%' }"></div></div>
      <span class="type-count">{{ t.count }}</span>
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

.toggle { display: flex; gap: 6px; margin-bottom: 16px; }
.toggle button { flex: 1; background: #f3e8ff; color: #7c3aed; padding: 8px 0; font-size: 0.85rem; }
.toggle button.active { background: #a855f7; color: #fff; }

.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.stat { text-align: center; padding: 16px 8px; margin-bottom: 0; }
.stat-num { font-size: 1.8rem; font-weight: 700; color: #a855f7; }
.stat-label { font-size: 0.78rem; color: #8b7aa3; margin-top: 2px; }
.stats + .card { margin-top: 16px; }

.bars { display: flex; gap: 6px; align-items: flex-end; height: 120px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; }
.bar-track { width: 100%; height: 100px; display: flex; align-items: flex-end; }
.bar-fill { width: 100%; background: linear-gradient(180deg, #c084fc, #e9d5ff); border-radius: 6px 6px 0 0; min-height: 2px; position: relative; transition: height 0.3s; }
.bar-val { position: absolute; top: -16px; left: 0; right: 0; text-align: center; font-size: 0.7rem; color: #a855f7; }
.bar-label { font-size: 0.7rem; color: #8b7aa3; margin-top: 4px; }

.type-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.type-name { width: 48px; font-size: 0.85rem; }
.type-track { flex: 1; background: #f3e8ff; border-radius: 6px; height: 14px; overflow: hidden; }
.type-fill { height: 100%; background: linear-gradient(90deg, #a855f7, #ec4899); border-radius: 6px; }
.type-count { width: 24px; text-align: right; font-size: 0.85rem; color: #8b7aa3; }
</style>

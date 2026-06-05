<script setup>
import { computed } from 'vue'
import { useWorkouts } from '../composables/useWorkouts'

const { workouts } = useWorkouts()

const totalCount = computed(() => workouts.value.length)
const totalMinutes = computed(() =>
  workouts.value.reduce((s, w) => s + (w.duration || 0), 0)
)
const totalDistance = computed(() =>
  Math.round(workouts.value.reduce((s, w) => s + (Number(w.distance) || 0), 0) * 10) / 10
)

// 本週（過去 7 天，含今天）運動次數
const thisWeekCount = computed(() => {
  const since = new Date()
  since.setDate(since.getDate() - 6)
  const sinceStr = since.toISOString().slice(0, 10)
  return workouts.value.filter((w) => w.date >= sinceStr).length
})

// 各運動類型次數分布
const byType = computed(() => {
  const map = {}
  for (const w of workouts.value) map[w.type] = (map[w.type] || 0) + 1
  const max = Math.max(1, ...Object.values(map))
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count, pct: Math.round((count / max) * 100) }))
})

// 最近 7 天每日時長（分鐘）長條
const last7Days = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const minutes = workouts.value
      .filter((w) => w.date === key)
      .reduce((s, w) => s + (w.duration || 0), 0)
    days.push({ key, label: `${d.getMonth() + 1}/${d.getDate()}`, minutes })
  }
  const max = Math.max(1, ...days.map((d) => d.minutes))
  return days.map((d) => ({ ...d, pct: Math.round((d.minutes / max) * 100) }))
})
</script>

<template>
  <div class="card">
    <h2>📊 統計總覽</h2>

    <div class="stats">
      <div class="stat">
        <div class="stat-num">{{ totalCount }}</div>
        <div class="stat-label">總次數</div>
      </div>
      <div class="stat">
        <div class="stat-num">{{ totalMinutes }}</div>
        <div class="stat-label">總分鐘</div>
      </div>
      <div class="stat">
        <div class="stat-num">{{ totalDistance }}</div>
        <div class="stat-label">總公里</div>
      </div>
      <div class="stat">
        <div class="stat-num">{{ thisWeekCount }}</div>
        <div class="stat-label">本週次數</div>
      </div>
    </div>

    <template v-if="totalCount">
      <h3 class="section-title">最近 7 天（分鐘）</h3>
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

      <h3 class="section-title">運動類型分布</h3>
      <div v-for="t in byType" :key="t.type" class="type-row">
        <span class="type-name">{{ t.type }}</span>
        <div class="type-track">
          <div class="type-fill" :style="{ width: t.pct + '%' }"></div>
        </div>
        <span class="type-count">{{ t.count }}</span>
      </div>
    </template>

    <p v-else class="muted">新增紀錄後這裡會出現統計圖表。</p>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.stat {
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 8px;
  text-align: center;
}
.stat-num { font-size: 1.5rem; font-weight: 700; color: #2563eb; }
.stat-label { font-size: 0.75rem; color: #6b7280; margin-top: 2px; }

.section-title { font-size: 0.95rem; margin: 22px 0 10px; }

.bars {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  height: 120px;
}
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; }
.bar-track {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: flex-end;
}
.bar-fill {
  width: 100%;
  background: #93c5fd;
  border-radius: 6px 6px 0 0;
  min-height: 2px;
  position: relative;
  transition: height 0.3s;
}
.bar-val {
  position: absolute;
  top: -16px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.7rem;
  color: #2563eb;
}
.bar-label { font-size: 0.7rem; color: #6b7280; margin-top: 4px; }

.type-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.type-name { width: 48px; font-size: 0.85rem; }
.type-track {
  flex: 1;
  background: #f1f5f9;
  border-radius: 6px;
  height: 14px;
  overflow: hidden;
}
.type-fill { height: 100%; background: #2563eb; border-radius: 6px; }
.type-count { width: 24px; text-align: right; font-size: 0.85rem; color: #6b7280; }
</style>

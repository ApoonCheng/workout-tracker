<script setup>
import { ref, computed } from 'vue'
import { useWorkouts } from '../composables/useWorkouts'
import { exportWorkoutsCsv } from '../lib/csv'
import { toDateStr, todayStr } from '../lib/date'

defineProps({
  selectedDate: { type: String, default: null },
})
const emit = defineEmits(['pick'])

const { workouts } = useWorkouts()

// ---- 期間切換：全部 / 本月 / 本週(過去7天) ----
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
  // week = 過去 7 天（含今天）
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

// ---- 連續運動天數（streak），從今天或昨天往回算 ----
const streak = computed(() => {
  const dates = new Set(workouts.value.map((w) => w.date))
  let s = 0
  const cursor = new Date()
  if (!dates.has(todayStr())) cursor.setDate(cursor.getDate() - 1) // 今天還沒運動也不算斷
  while (dates.has(toDateStr(cursor))) {
    s++
    cursor.setDate(cursor.getDate() - 1)
  }
  return s
})

// ---- 各類型分布（依期間） ----
const byType = computed(() => {
  const map = {}
  for (const w of filtered.value) map[w.type] = (map[w.type] || 0) + 1
  const max = Math.max(1, ...Object.values(map))
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([type, c]) => ({ type, count: c, pct: Math.round((c / max) * 100) }))
})

// ---- 月曆檢視（可切換月份） ----
const calMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const minutesByDate = computed(() => {
  const map = {}
  for (const w of workouts.value) map[w.date] = (map[w.date] || 0) + (w.duration || 0)
  return map
})

const calTitle = computed(
  () => `${calMonth.value.getFullYear()} 年 ${calMonth.value.getMonth() + 1} 月`
)

const calCells = computed(() => {
  const y = calMonth.value.getFullYear()
  const m = calMonth.value.getMonth()
  const firstWeekday = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const key = toDateStr(new Date(y, m, d))
    const mins = minutesByDate.value[key] || 0
    cells.push({ day: d, key, mins, isToday: key === todayStr() })
  }
  return cells
})

function shiftMonth(delta) {
  calMonth.value = new Date(calMonth.value.getFullYear(), calMonth.value.getMonth() + delta, 1)
}

// 依當天分鐘數決定底色深淺
function heatStyle(mins) {
  if (!mins) return {}
  const level = Math.min(1, mins / 60) // 60 分以上最深
  return { background: `rgba(37, 99, 235, ${0.25 + level * 0.55})`, color: level > 0.5 ? '#fff' : '#1f2937' }
}

// ---- 最近 7 天長條 ----
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

function onExport() {
  if (!workouts.value.length) return alert('還沒有紀錄可以匯出')
  exportWorkoutsCsv(workouts.value)
}
</script>

<template>
  <div class="card">
    <div class="dash-head">
      <h2>📊 統計總覽</h2>
      <span v-if="streak" class="streak">🔥 連續 {{ streak }} 天</span>
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
      <div class="stat">
        <div class="stat-num">{{ count }}</div>
        <div class="stat-label">次數</div>
      </div>
      <div class="stat">
        <div class="stat-num">{{ minutes }}</div>
        <div class="stat-label">分鐘</div>
      </div>
      <div class="stat">
        <div class="stat-num">{{ distance }}</div>
        <div class="stat-label">公里</div>
      </div>
      <div class="stat">
        <div class="stat-num">{{ activeDays }}</div>
        <div class="stat-label">運動天數</div>
      </div>
    </div>

    <!-- 月曆檢視 -->
    <div class="cal-head">
      <button class="ghost" @click="shiftMonth(-1)">‹</button>
      <h3 class="section-title" style="margin: 0">{{ calTitle }}</h3>
      <button class="ghost" @click="shiftMonth(1)">›</button>
    </div>
    <div class="cal-grid">
      <div v-for="w in weekDays" :key="w" class="cal-weekday">{{ w }}</div>
      <div
        v-for="(c, i) in calCells"
        :key="i"
        class="cal-cell"
        :class="{ today: c?.isToday, empty: !c, clickable: !!c, selected: c && c.key === selectedDate }"
        :style="c ? heatStyle(c.mins) : {}"
        :title="c ? (c.mins ? `${c.key}：${c.mins} 分鐘` : `${c.key}：點一下新增`) : ''"
        @click="c && emit('pick', c.key)"
      >
        <span v-if="c">{{ c.day }}</span>
      </div>
    </div>

    <template v-if="workouts.length">
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

      <h3 class="section-title">運動類型分布（{{ periods.find((p) => p.key === period).label }}）</h3>
      <p v-if="!byType.length" class="muted">這個期間還沒有紀錄。</p>
      <div v-for="t in byType" :key="t.type" class="type-row">
        <span class="type-name">{{ t.type }}</span>
        <div class="type-track"><div class="type-fill" :style="{ width: t.pct + '%' }"></div></div>
        <span class="type-count">{{ t.count }}</span>
      </div>

      <button class="ghost export-btn" @click="onExport">⬇️ 匯出 CSV</button>
    </template>

    <p v-else class="muted">新增紀錄後這裡會出現統計圖表。</p>
  </div>
</template>

<style scoped>
.dash-head { display: flex; align-items: center; justify-content: space-between; }
.dash-head h2 { margin: 0; }
.streak {
  background: #fff7ed;
  color: #c2410c;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
}

.toggle { display: flex; gap: 6px; margin: 14px 0; }
.toggle button {
  flex: 1;
  background: #f1f5f9;
  color: #475569;
  padding: 6px 0;
  font-size: 0.85rem;
}
.toggle button.active { background: #2563eb; color: #fff; }

.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.stat { background: #f8fafc; border-radius: 10px; padding: 12px 8px; text-align: center; }
.stat-num { font-size: 1.5rem; font-weight: 700; color: #2563eb; }
.stat-label { font-size: 0.75rem; color: #6b7280; margin-top: 2px; }

.section-title { font-size: 0.95rem; margin: 22px 0 10px; }

.cal-head { display: flex; align-items: center; justify-content: space-between; margin: 22px 0 8px; }
.cal-head .ghost { font-size: 1.3rem; padding: 0 10px; line-height: 1; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-weekday { text-align: center; font-size: 0.72rem; color: #94a3b8; padding-bottom: 2px; }
.cal-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  border-radius: 7px;
  background: #f8fafc;
  color: #1f2937;
}
.cal-cell.empty { background: transparent; }
.cal-cell.clickable { cursor: pointer; }
.cal-cell.clickable:hover { outline: 2px solid #93c5fd; outline-offset: -2px; }
.cal-cell.today { outline: 2px solid #2563eb; outline-offset: -2px; font-weight: 700; }
.cal-cell.selected { outline: 2px solid #f97316; outline-offset: -2px; font-weight: 700; }

.bars { display: flex; gap: 6px; align-items: flex-end; height: 120px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; }
.bar-track { width: 100%; height: 100px; display: flex; align-items: flex-end; }
.bar-fill {
  width: 100%; background: #93c5fd; border-radius: 6px 6px 0 0;
  min-height: 2px; position: relative; transition: height 0.3s;
}
.bar-val { position: absolute; top: -16px; left: 0; right: 0; text-align: center; font-size: 0.7rem; color: #2563eb; }
.bar-label { font-size: 0.7rem; color: #6b7280; margin-top: 4px; }

.type-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.type-name { width: 48px; font-size: 0.85rem; }
.type-track { flex: 1; background: #f1f5f9; border-radius: 6px; height: 14px; overflow: hidden; }
.type-fill { height: 100%; background: #2563eb; border-radius: 6px; }
.type-count { width: 24px; text-align: right; font-size: 0.85rem; color: #6b7280; }

.export-btn { margin-top: 20px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 14px; width: 100%; }
</style>

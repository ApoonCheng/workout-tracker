<script setup>
import { ref, computed } from 'vue'
import { useWorkouts } from '../composables/useWorkouts'
import { toDateStr, todayStr } from '../lib/date'

defineProps({
  selectedDate: { type: String, default: null },
})
const emit = defineEmits(['pick'])

const { workouts } = useWorkouts()

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
    cells.push({ day: d, key, mins: minutesByDate.value[key] || 0, isToday: key === todayStr() })
  }
  return cells
})

function shiftMonth(delta) {
  calMonth.value = new Date(calMonth.value.getFullYear(), calMonth.value.getMonth() + delta, 1)
}

function heatStyle(mins) {
  if (!mins) return {}
  const level = Math.min(1, mins / 60)
  return { background: `rgba(37, 99, 235, ${0.25 + level * 0.55})`, color: level > 0.5 ? '#fff' : '#1f2937' }
}
</script>

<template>
  <div class="card">
    <div class="cal-head">
      <button class="ghost" @click="shiftMonth(-1)">‹</button>
      <h2 style="margin: 0">{{ calTitle }}</h2>
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

    <p class="muted cal-hint">
      點<strong>有顏色</strong>的日子看當天紀錄；點<strong>空白</strong>日子可快速新增。顏色越深代表運動時間越長。
    </p>
  </div>
</template>

<style scoped>
.cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.cal-head .ghost { font-size: 1.5rem; padding: 0 12px; line-height: 1; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.cal-weekday { text-align: center; font-size: 0.75rem; color: #94a3b8; padding-bottom: 4px; }
.cal-cell {
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; border-radius: 8px; background: #f8fafc; color: #1f2937;
}
.cal-cell.empty { background: transparent; }
.cal-cell.clickable { cursor: pointer; }
.cal-cell.clickable:active { transform: scale(0.92); }
.cal-cell.today { outline: 2px solid #2563eb; outline-offset: -2px; font-weight: 700; }
.cal-cell.selected { outline: 2px solid #f97316; outline-offset: -2px; font-weight: 700; }
.cal-hint { margin-top: 16px; line-height: 1.6; }
</style>

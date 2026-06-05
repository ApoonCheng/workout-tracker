<script setup>
import { ref, computed } from 'vue'
import { useLog } from '../composables/useLog'
import { toDateStr, todayStr } from '../lib/date'

const emit = defineEmits(['add-strength', 'add-cardio', 'edit-strength', 'edit-cardio'])
const { strengthGroups, cardio, removeStrengthGroup, removeCardio } = useLog()

const selected = ref(todayStr())
const calMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 每天的重訓動作數量（用來決定月曆深淺）
const loadByDate = computed(() => {
  const map = {}
  for (const g of strengthGroups.value) map[g.date] = (map[g.date] || 0) + 1
  return map
})
const cardioDates = computed(() => new Set(cardio.value.map((c) => c.date)))

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
    cells.push({
      day: d,
      key,
      groups: loadByDate.value[key] || 0,
      hasCardio: cardioDates.value.has(key),
      isToday: key === todayStr(),
    })
  }
  return cells
})

function shiftMonth(delta) {
  calMonth.value = new Date(calMonth.value.getFullYear(), calMonth.value.getMonth() + delta, 1)
}

function heatStyle(groups) {
  if (!groups) return {}
  const level = Math.min(1, groups / 5)
  return { background: `rgba(168, 85, 247, ${0.22 + level * 0.6})`, color: level > 0.45 ? '#fff' : '#5b2a8a' }
}

// 選取日的明細
const dayStrength = computed(() => strengthGroups.value.filter((g) => g.date === selected.value))
const dayCardio = computed(() => cardio.value.filter((c) => c.date === selected.value))

function setSummary(sets) {
  return sets
    .map((s) => (s.weight != null ? `${s.weight}kg×${s.reps}` : `${s.reps}次`))
    .join('、')
}

function selectedLabel() {
  const [y, m, d] = selected.value.split('-')
  return `${Number(m)}/${Number(d)}`
}

async function delStrength(g) {
  if (!confirm(`刪除 ${g.exercise}（${g.sets.length} 組）？`)) return
  await removeStrengthGroup(g.group_id)
}
async function delCardio(c) {
  if (!confirm(`刪除 ${c.type}？`)) return
  await removeCardio(c.id)
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
        :class="{ today: c?.isToday, empty: !c, clickable: !!c, selected: c && c.key === selected }"
        :style="c ? heatStyle(c.groups) : {}"
        @click="c && (selected = c.key)"
      >
        <template v-if="c">
          <span>{{ c.day }}</span>
          <span v-if="c.hasCardio" class="cardio-dot"></span>
        </template>
      </div>
    </div>
    <p class="muted legend">紫格＝重訓（越深組數越多）· 橘點＝有氧</p>
  </div>

  <!-- 選取日明細 -->
  <div class="card">
    <div class="topbar">
      <h2 style="margin: 0">{{ selectedLabel() }} 的訓練</h2>
    </div>

    <p v-if="!dayStrength.length && !dayCardio.length" class="muted" style="margin: 12px 0">
      這天還沒有紀錄。
    </p>

    <div v-for="g in dayStrength" :key="g.group_id" class="entry">
      <div class="entry-main">
        <div class="entry-title">💪 {{ g.exercise }} <span class="muted">· {{ g.sets.length }} 組</span></div>
        <div class="entry-detail">{{ setSummary(g.sets) }}</div>
      </div>
      <div class="entry-actions">
        <button class="ghost" @click="emit('edit-strength', g)">編輯</button>
        <button class="ghost del" @click="delStrength(g)">刪除</button>
      </div>
    </div>

    <div v-for="c in dayCardio" :key="c.id" class="entry">
      <div class="entry-main">
        <div class="entry-title">🏃 {{ c.type }}</div>
        <div class="entry-detail">
          <template v-if="c.duration">{{ c.duration }} 分</template>
          <template v-if="c.distance"> · {{ c.distance }} km</template>
          <template v-if="c.note"> · {{ c.note }}</template>
        </div>
      </div>
      <div class="entry-actions">
        <button class="ghost" @click="emit('edit-cardio', c)">編輯</button>
        <button class="ghost del" @click="delCardio(c)">刪除</button>
      </div>
    </div>

    <div class="add-row">
      <button class="add-strength" @click="emit('add-strength', selected)">＋ 重訓</button>
      <button class="add-cardio" @click="emit('add-cardio', selected)">＋ 有氧</button>
    </div>
  </div>
</template>

<style scoped>
.cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.cal-head .ghost { font-size: 1.5rem; padding: 0 12px; line-height: 1; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.cal-weekday { text-align: center; font-size: 0.75rem; color: #b8a9cf; padding-bottom: 4px; }
.cal-cell {
  position: relative;
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; border-radius: 8px; background: #f6f0ff; color: #5b2a8a;
}
.cal-cell.empty { background: transparent; }
.cal-cell.clickable { cursor: pointer; }
.cal-cell.clickable:active { transform: scale(0.92); }
.cal-cell.today { outline: 2px solid #a855f7; outline-offset: -2px; font-weight: 700; }
.cal-cell.selected { outline: 2px solid #ec4899; outline-offset: -2px; font-weight: 700; }
.cardio-dot {
  position: absolute; bottom: 4px; width: 5px; height: 5px;
  border-radius: 50%; background: #fb923c;
}
.legend { margin-top: 12px; font-size: 0.78rem; }

.topbar { display: flex; align-items: center; justify-content: space-between; }
.entry {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;
  border-top: 1px solid #f3edfb; padding: 12px 0;
}
.entry:first-of-type { border-top: none; }
.entry-title { font-weight: 600; font-size: 0.95rem; }
.entry-detail { color: #6b5b80; font-size: 0.88rem; margin-top: 3px; }
.entry-actions { flex: 0 0 auto; display: flex; gap: 2px; }
.entry-actions .del:hover { color: #e11d57; background: #fdf2f8; }

.add-row { display: flex; gap: 10px; margin-top: 14px; }
.add-row button { flex: 1; }
.add-strength { background: #a855f7; }
.add-cardio { background: #fb923c; }
.add-cardio:hover { background: #f97316; }
</style>

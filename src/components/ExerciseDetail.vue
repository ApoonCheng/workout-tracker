<script setup>
import { computed } from 'vue'
import { useLog } from '../composables/useLog'

const props = defineProps({
  name: { type: String, required: true },
})
defineEmits(['close'])

const { strengthGroups } = useLog()

// 這個動作的所有訓練日（依日期由舊到新）
const sessions = computed(() => {
  const list = strengthGroups.value
    .filter((g) => g.exercise === props.name)
    .map((g) => {
      const weights = g.sets.map((s) => Number(s.weight) || 0)
      const maxWeight = Math.max(0, ...weights)
      const totalReps = g.sets.reduce((s, x) => s + (Number(x.reps) || 0), 0)
      const volume = g.sets.reduce((s, x) => s + (Number(x.weight) || 0) * (Number(x.reps) || 0), 0)
      return { ...g, maxWeight, totalReps, volume }
    })
  return list.sort((a, b) => (a.date < b.date ? -1 : 1))
})

const totalSessions = computed(() => sessions.value.length)
const bestWeight = computed(() => Math.max(0, ...sessions.value.map((s) => s.maxWeight)))
const lastDate = computed(() => (sessions.value.length ? sessions.value[sessions.value.length - 1].date : '-'))

// 最近 12 次的最大重量長條
const chart = computed(() => {
  const recent = sessions.value.slice(-12)
  const max = Math.max(1, ...recent.map((s) => s.maxWeight))
  return recent.map((s) => ({
    date: s.date.slice(5),
    weight: s.maxWeight,
    pct: Math.round((s.maxWeight / max) * 100),
  }))
})

function setSummary(sets) {
  return sets
    .map((s) => (s.weight != null ? `${s.weight}kg×${s.reps}` : `${s.reps}次`))
    .join('、')
}
</script>

<template>
  <div class="card">
    <div class="topbar">
      <h2 style="margin: 0">💪 {{ name }}</h2>
      <button class="ghost" @click="$emit('close')">✕</button>
    </div>

    <div class="mini-stats">
      <div><b>{{ totalSessions }}</b><span>訓練次數</span></div>
      <div><b>{{ bestWeight }}</b><span>最佳重量(kg)</span></div>
      <div><b>{{ lastDate.slice(5) }}</b><span>最近一次</span></div>
    </div>

    <h3 class="sec">最大重量趨勢（最近 {{ chart.length }} 次）</h3>
    <div class="bars">
      <div v-for="(c, i) in chart" :key="i" class="bar-col">
        <div class="bar-track">
          <div class="bar-fill" :style="{ height: c.pct + '%' }">
            <span class="bar-val">{{ c.weight }}</span>
          </div>
        </div>
        <div class="bar-label">{{ c.date }}</div>
      </div>
    </div>

    <h3 class="sec">紀錄</h3>
    <div v-for="s in [...sessions].reverse()" :key="s.group_id" class="hist">
      <div class="hist-date">{{ s.date.slice(5) }}</div>
      <div class="hist-detail">
        {{ setSummary(s.sets) }}
        <div class="muted">總量 {{ s.volume }} kg · {{ s.totalReps }} 下</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topbar { display: flex; align-items: center; justify-content: space-between; }
.mini-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 14px 0 4px; }
.mini-stats div { background: #f8f4ff; border-radius: 10px; padding: 12px 6px; text-align: center; }
.mini-stats b { display: block; font-size: 1.3rem; color: #a855f7; }
.mini-stats span { font-size: 0.72rem; color: #8b7aa3; }
.sec { font-size: 0.95rem; margin: 20px 0 10px; }

.bars { display: flex; gap: 5px; align-items: flex-end; height: 120px; overflow-x: auto; }
.bar-col { flex: 1 0 28px; display: flex; flex-direction: column; align-items: center; }
.bar-track { width: 100%; height: 100px; display: flex; align-items: flex-end; }
.bar-fill {
  width: 100%; background: linear-gradient(180deg, #c084fc, #e9d5ff);
  border-radius: 6px 6px 0 0; min-height: 2px; position: relative;
}
.bar-val { position: absolute; top: -16px; left: 0; right: 0; text-align: center; font-size: 0.68rem; color: #a855f7; }
.bar-label { font-size: 0.66rem; color: #8b7aa3; margin-top: 4px; }

.hist { display: flex; gap: 12px; border-top: 1px solid #f3edfb; padding: 10px 0; }
.hist:first-of-type { border-top: none; }
.hist-date { flex: 0 0 44px; font-weight: 600; color: #7c3aed; font-size: 0.9rem; }
.hist-detail { font-size: 0.9rem; }
</style>

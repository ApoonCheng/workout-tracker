<script setup>
import { computed } from 'vue'
import { useWorkouts } from '../composables/useWorkouts'

const props = defineProps({
  // 只顯示這一天的紀錄；null 代表全部
  filterDate: { type: String, default: null },
})
const emit = defineEmits(['edit', 'clear-filter'])

const { workouts, loading, error, removeWorkout } = useWorkouts()

const shown = computed(() =>
  props.filterDate
    ? workouts.value.filter((w) => w.date === props.filterDate)
    : workouts.value
)

async function onDelete(id) {
  if (!confirm('確定要刪除這筆紀錄嗎？')) return
  try {
    await removeWorkout(id)
  } catch (e) {
    alert('刪除失敗：' + e.message)
  }
}
</script>

<template>
  <div class="card">
    <div class="topbar">
      <h2>運動歷程</h2>
      <button v-if="filterDate" class="ghost" @click="emit('clear-filter')">✕ 清除篩選</button>
    </div>

    <p v-if="filterDate" class="muted">只看 {{ filterDate }}（共 {{ shown.length }} 筆）</p>

    <p v-if="loading" class="muted">載入中…</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!loading && !shown.length" class="muted">
      {{ filterDate ? '這一天沒有紀錄。' : '還沒有紀錄，從上面新增第一筆吧！' }}
    </p>

    <div v-for="w in shown" :key="w.id" class="workout-item">
      <div>
        <strong>{{ w.type }}</strong>
        <span class="workout-meta">
          · {{ w.date }}
          <template v-if="w.duration"> · {{ w.duration }} 分</template>
          <template v-if="w.distance"> · {{ w.distance }} km</template>
        </span>
        <div v-if="w.note" class="muted">{{ w.note }}</div>
      </div>
      <div class="row" style="gap: 6px; flex: 0 0 auto">
        <button class="ghost" @click="emit('edit', w)">編輯</button>
        <button class="danger" @click="onDelete(w.id)">刪除</button>
      </div>
    </div>
  </div>
</template>

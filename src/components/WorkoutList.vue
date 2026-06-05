<script setup>
import { useWorkouts } from '../composables/useWorkouts'

const emit = defineEmits(['edit'])
const { workouts, loading, error, removeWorkout } = useWorkouts()

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
    <h2>運動歷程</h2>

    <p v-if="loading" class="muted">載入中…</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!loading && !workouts.length" class="muted">
      還沒有紀錄，從上面新增第一筆吧！
    </p>

    <div v-for="w in workouts" :key="w.id" class="workout-item">
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

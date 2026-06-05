<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'

const workouts = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  const { data, error: e } = await supabase
    .from('workouts')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (e) error.value = e.message
  else workouts.value = data
  loading.value = false
}

async function remove(id) {
  if (!confirm('確定要刪除這筆紀錄嗎？')) return
  const { error: e } = await supabase.from('workouts').delete().eq('id', id)
  if (e) error.value = e.message
  else workouts.value = workouts.value.filter((w) => w.id !== id)
}

const totalCount = computed(() => workouts.value.length)
const totalMinutes = computed(() =>
  workouts.value.reduce((sum, w) => sum + (w.duration || 0), 0)
)

onMounted(load)
defineExpose({ load })
</script>

<template>
  <div class="card">
    <h2>運動歷程</h2>

    <p v-if="!loading && totalCount" class="muted">
      共 {{ totalCount }} 筆 · 累積 {{ totalMinutes }} 分鐘
    </p>

    <p v-if="loading" class="muted">載入中…</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!loading && !totalCount" class="muted">還沒有紀錄，從上面新增第一筆吧！</p>

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
      <button class="danger" @click="remove(w.id)">刪除</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useWorkouts } from '../composables/useWorkouts'
import { exportWorkoutsCsv } from '../lib/csv'

const { workouts } = useWorkouts()
const email = ref('')

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  email.value = data.user?.email || ''
})

function onExport() {
  if (!workouts.value.length) return alert('還沒有紀錄可以匯出')
  exportWorkoutsCsv(workouts.value)
}

async function signOut() {
  if (!confirm('確定要登出嗎？')) return
  await supabase.auth.signOut()
}
</script>

<template>
  <div class="card">
    <h2>帳號</h2>
    <p class="muted">{{ email }}</p>
  </div>

  <div class="card">
    <h2>資料</h2>
    <button class="list-btn" @click="onExport">
      <span>⬇️ 匯出 CSV</span>
      <span class="chev">›</span>
    </button>
    <p class="muted" style="margin-top: 8px">
      共 {{ workouts.length }} 筆紀錄，匯出後可用 Excel 開啟備份。
    </p>
  </div>

  <div class="card">
    <h2>關於</h2>
    <p class="muted">運動歷程紀錄 · Vue + Supabase PWA</p>
  </div>

  <button class="signout" @click="signOut">登出</button>
</template>

<style scoped>
.list-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  padding: 14px 16px;
  font-size: 0.95rem;
}
.chev { color: #9ca3af; font-size: 1.2rem; }
.signout {
  width: 100%;
  background: #fff;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 14px;
  font-size: 0.95rem;
  margin-top: 8px;
}
.signout:hover { background: #fef2f2; }
</style>

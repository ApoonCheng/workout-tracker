<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useLog } from '../composables/useLog'
import { exportStrengthCsv, exportCardioCsv } from '../lib/csv'

const { strengthGroups, cardio } = useLog()
const email = ref('')

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  email.value = data.user?.email || ''
})

function exportStrength() {
  if (!strengthGroups.value.length) return alert('還沒有重訓紀錄可以匯出')
  exportStrengthCsv(strengthGroups.value)
}
function exportCardio() {
  if (!cardio.value.length) return alert('還沒有有氧紀錄可以匯出')
  exportCardioCsv(cardio.value)
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
    <h2>匯出資料</h2>
    <button class="list-btn" @click="exportStrength">
      <span>💪 匯出重訓 CSV</span><span class="chev">›</span>
    </button>
    <button class="list-btn" @click="exportCardio">
      <span>🏃 匯出有氧 CSV</span><span class="chev">›</span>
    </button>
    <p class="muted" style="margin-top: 8px">匯出後可用 Excel 開啟備份。</p>
  </div>

  <div class="card">
    <h2>關於</h2>
    <p class="muted">重訓紀錄 · Vue + Supabase PWA</p>
  </div>

  <button class="signout" @click="signOut">登出</button>
</template>

<style scoped>
.list-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  background: #f8f4ff; color: #3b2f4a; border: 1px solid #efe6fb;
  padding: 14px 16px; font-size: 0.95rem; margin-bottom: 10px;
}
.chev { color: #c4b5d6; font-size: 1.2rem; }
.signout {
  width: 100%; background: #fff; color: #e11d57;
  border: 1px solid #fbcfe8; padding: 14px; font-size: 0.95rem; margin-top: 8px;
}
.signout:hover { background: #fdf2f8; }
</style>

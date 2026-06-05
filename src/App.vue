<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from './lib/supabase'
import { useWorkouts } from './composables/useWorkouts'
import Auth from './components/Auth.vue'
import Dashboard from './components/Dashboard.vue'
import WorkoutForm from './components/WorkoutForm.vue'
import WorkoutList from './components/WorkoutList.vue'
import Modal from './components/Modal.vue'

const session = ref(null)
const editing = ref(null)        // 編輯中的紀錄
const quickAddDate = ref(null)   // 從月曆空白日快速新增的日期
const filterDate = ref(null)     // 列表只看某一天

const { load, workouts } = useWorkouts()

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })
})

// 登入後載入資料；登出後清空狀態
watch(session, (s) => {
  if (s) load()
  else {
    editing.value = null
    filterDate.value = null
  }
})

// 點月曆某一天：有紀錄→篩選列表；沒紀錄→快速新增
function onPickDate(date) {
  if (workouts.value.some((w) => w.date === date)) {
    filterDate.value = date
  } else {
    quickAddDate.value = date
  }
}

function startEdit(workout) {
  editing.value = workout
}

function closeModal() {
  editing.value = null
  quickAddDate.value = null
}

async function signOut() {
  await supabase.auth.signOut()
}
</script>

<template>
  <div class="container">
    <div class="topbar">
      <h1>🏃 運動歷程</h1>
      <button v-if="session" class="ghost" @click="signOut">登出</button>
    </div>

    <template v-if="session">
      <Dashboard :selected-date="filterDate" @pick="onPickDate" />
      <WorkoutForm />
      <WorkoutList
        :filter-date="filterDate"
        @edit="startEdit"
        @clear-filter="filterDate = null"
      />

      <!-- 編輯 / 快速新增 彈窗 -->
      <Modal :show="!!editing || !!quickAddDate" @close="closeModal">
        <WorkoutForm
          :editing="editing"
          :preset-date="quickAddDate"
          @done="closeModal"
          @cancel="closeModal"
        />
      </Modal>
    </template>

    <Auth v-else />
  </div>
</template>

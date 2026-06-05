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
const editing = ref(null)

const { load } = useWorkouts()

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })
})

// 登入後載入資料；登出後清空編輯狀態
watch(session, (s) => {
  if (s) load()
  else editing.value = null
})

function startEdit(workout) {
  editing.value = workout
}

function closeEdit() {
  editing.value = null
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
      <Dashboard />
      <WorkoutForm @done="() => {}" />
      <WorkoutList @edit="startEdit" />

      <!-- 編輯彈窗 -->
      <Modal :show="!!editing" @close="closeEdit">
        <WorkoutForm :editing="editing" @done="closeEdit" @cancel="closeEdit" />
      </Modal>
    </template>

    <Auth v-else />
  </div>
</template>

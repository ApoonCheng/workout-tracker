<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from './lib/supabase'
import { useWorkouts } from './composables/useWorkouts'
import { todayStr } from './lib/date'
import Auth from './components/Auth.vue'
import HomeView from './views/HomeView.vue'
import CalendarView from './views/CalendarView.vue'
import SettingsView from './views/SettingsView.vue'
import WorkoutForm from './components/WorkoutForm.vue'
import WorkoutList from './components/WorkoutList.vue'
import Modal from './components/Modal.vue'

const session = ref(null)
const tab = ref('home')
const editing = ref(null)
const quickAddDate = ref(null)
const filterDate = ref(null)

const { load, workouts } = useWorkouts()

const tabs = [
  { key: 'home', label: '首頁', icon: '🏠' },
  { key: 'calendar', label: '月曆', icon: '📅' },
  { key: 'history', label: '紀錄', icon: '📋' },
  { key: 'settings', label: '設定', icon: '⚙️' },
]
const titles = { home: '運動歷程', calendar: '月曆', history: '運動紀錄', settings: '設定' }

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })
})

watch(session, (s) => {
  if (s) load()
  else {
    editing.value = null
    filterDate.value = null
    tab.value = 'home'
  }
})

// 點月曆某一天：有紀錄→切到「紀錄」並篩選；沒紀錄→快速新增
function onPickDate(date) {
  if (workouts.value.some((w) => w.date === date)) {
    filterDate.value = date
    tab.value = 'history'
  } else {
    quickAddDate.value = date
  }
}

function openAdd() {
  quickAddDate.value = todayStr()
}

function startEdit(workout) {
  editing.value = workout
}

function closeModal() {
  editing.value = null
  quickAddDate.value = null
}

function clearFilter() {
  filterDate.value = null
}
</script>

<template>
  <div v-if="session" class="app-shell">
    <header class="app-header">
      <span class="app-title">{{ titles[tab] }}</span>
    </header>

    <main class="app-main">
      <HomeView v-if="tab === 'home'" />
      <CalendarView v-else-if="tab === 'calendar'" :selected-date="filterDate" @pick="onPickDate" />
      <template v-else-if="tab === 'history'">
        <WorkoutList :filter-date="filterDate" @edit="startEdit" @clear-filter="clearFilter" />
      </template>
      <SettingsView v-else-if="tab === 'settings'" />
    </main>

    <nav class="bottom-nav">
      <button
        v-for="t in tabs.slice(0, 2)"
        :key="t.key"
        class="nav-item"
        :class="{ active: tab === t.key }"
        @click="tab = t.key"
      >
        <span class="nav-icon">{{ t.icon }}</span>
        <span class="nav-label">{{ t.label }}</span>
      </button>

      <button class="nav-add" @click="openAdd" aria-label="新增紀錄">＋</button>

      <button
        v-for="t in tabs.slice(2)"
        :key="t.key"
        class="nav-item"
        :class="{ active: tab === t.key }"
        @click="tab = t.key"
      >
        <span class="nav-icon">{{ t.icon }}</span>
        <span class="nav-label">{{ t.label }}</span>
      </button>
    </nav>

    <!-- 編輯 / 快速新增 彈窗 -->
    <Modal :show="!!editing || !!quickAddDate" @close="closeModal">
      <WorkoutForm
        :editing="editing"
        :preset-date="quickAddDate"
        @done="closeModal"
        @cancel="closeModal"
      />
    </Modal>
  </div>

  <div v-else class="container">
    <div class="topbar"><h1>🏃 運動歷程</h1></div>
    <Auth />
  </div>
</template>

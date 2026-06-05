<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from './lib/supabase'
import { useLog } from './composables/useLog'
import { todayStr } from './lib/date'
import Auth from './components/Auth.vue'
import CalendarView from './views/CalendarView.vue'
import ExercisesView from './views/ExercisesView.vue'
import StatsView from './views/StatsView.vue'
import SettingsView from './views/SettingsView.vue'
import StrengthForm from './components/StrengthForm.vue'
import CardioForm from './components/CardioForm.vue'
import Modal from './components/Modal.vue'

const session = ref(null)
const tab = ref('calendar')
// modal: { type:'choose'|'strength'|'cardio', editing, presetDate }
const modal = ref(null)

const { loadAll } = useLog()

const tabs = [
  { key: 'calendar', label: '日曆', icon: '📅' },
  { key: 'exercises', label: '動作', icon: '💪' },
  { key: 'stats', label: '統計', icon: '📊' },
  { key: 'settings', label: '設定', icon: '⚙️' },
]
const titles = { calendar: '訓練日曆', exercises: '動作', stats: '統計', settings: '設定' }

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })
})

watch(session, (s) => {
  if (s) loadAll()
  else {
    modal.value = null
    tab.value = 'calendar'
  }
})

function openChooser() {
  modal.value = { type: 'choose', presetDate: todayStr(), editing: null }
}
function chooseStrength() {
  modal.value = { type: 'strength', presetDate: modal.value?.presetDate || todayStr(), editing: null }
}
function chooseCardio() {
  modal.value = { type: 'cardio', presetDate: modal.value?.presetDate || todayStr(), editing: null }
}
function closeModal() {
  modal.value = null
}

// 來自日曆的事件
function onAddStrength(date) {
  modal.value = { type: 'strength', presetDate: date, editing: null }
}
function onAddCardio(date) {
  modal.value = { type: 'cardio', presetDate: date, editing: null }
}
function onEditStrength(group) {
  modal.value = { type: 'strength', presetDate: null, editing: group }
}
function onEditCardio(obj) {
  modal.value = { type: 'cardio', presetDate: null, editing: obj }
}
</script>

<template>
  <div v-if="session" class="app-shell">
    <header class="app-header">
      <span class="app-title">{{ titles[tab] }}</span>
    </header>

    <main class="app-main">
      <CalendarView
        v-if="tab === 'calendar'"
        @add-strength="onAddStrength"
        @add-cardio="onAddCardio"
        @edit-strength="onEditStrength"
        @edit-cardio="onEditCardio"
      />
      <ExercisesView v-else-if="tab === 'exercises'" />
      <StatsView v-else-if="tab === 'stats'" />
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

      <button class="nav-add" @click="openChooser" aria-label="新增紀錄">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.6" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

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

    <!-- 新增 / 編輯 彈窗 -->
    <Modal :show="!!modal" @close="closeModal">
      <div v-if="modal?.type === 'choose'" class="card chooser">
        <h2>要新增什麼？</h2>
        <button class="pick strength" @click="chooseStrength">💪 重訓</button>
        <button class="pick cardio" @click="chooseCardio">🏃 有氧</button>
      </div>
      <StrengthForm
        v-else-if="modal?.type === 'strength'"
        :editing="modal.editing"
        :preset-date="modal.presetDate"
        @done="closeModal"
        @cancel="closeModal"
      />
      <CardioForm
        v-else-if="modal?.type === 'cardio'"
        :editing="modal.editing"
        :preset-date="modal.presetDate"
        @done="closeModal"
        @cancel="closeModal"
      />
    </Modal>
  </div>

  <div v-else class="container">
    <div class="topbar"><h1>🏋️ 重訓紀錄</h1></div>
    <Auth />
  </div>
</template>

<style scoped>
.chooser h2 { text-align: center; margin-bottom: 16px; }
.pick {
  width: 100%; padding: 18px; font-size: 1.1rem; margin-bottom: 12px;
}
.pick.strength { background: #a855f7; }
.pick.cardio { background: #fb923c; }
.pick.cardio:hover { background: #f97316; }
</style>

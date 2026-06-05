<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabase'
import Auth from './components/Auth.vue'
import WorkoutForm from './components/WorkoutForm.vue'
import WorkoutList from './components/WorkoutList.vue'

const session = ref(null)
const listRef = ref(null)

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })
})

function onAdded() {
  listRef.value?.load()
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
      <WorkoutForm @added="onAdded" />
      <WorkoutList ref="listRef" />
    </template>

    <Auth v-else />
  </div>
</template>

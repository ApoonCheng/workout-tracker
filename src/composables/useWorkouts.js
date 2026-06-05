import { ref } from 'vue'
import { supabase } from '../lib/supabase'

// 模組層級的狀態 → 所有元件共用同一份資料，自動同步
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

async function addWorkout(fields) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error: e } = await supabase
    .from('workouts')
    .insert({ ...fields, user_id: user.id })
  if (e) throw e
  await load()
}

async function updateWorkout(id, fields) {
  const { error: e } = await supabase
    .from('workouts')
    .update(fields)
    .eq('id', id)
  if (e) throw e
  await load()
}

async function removeWorkout(id) {
  const { error: e } = await supabase.from('workouts').delete().eq('id', id)
  if (e) throw e
  workouts.value = workouts.value.filter((w) => w.id !== id)
}

export function useWorkouts() {
  return { workouts, loading, error, load, addWorkout, updateWorkout, removeWorkout }
}

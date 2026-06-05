import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

// 模組層級狀態 → 全 App 共用
const strengthSets = ref([]) // 攤平的每一組
const cardio = ref([])
const loading = ref(true)
const error = ref('')

async function loadAll() {
  loading.value = true
  error.value = ''
  const [s, c] = await Promise.all([
    supabase
      .from('strength_sets')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: true })
      .order('set_order', { ascending: true }),
    supabase.from('workouts').select('*').order('date', { ascending: false }),
  ])
  if (s.error) error.value = s.error.message
  else strengthSets.value = s.data
  if (c.error) error.value = c.error.message
  else cardio.value = c.data
  loading.value = false
}

// 把攤平的 set 依 group_id 整理成「一個動作含多組」
const strengthGroups = computed(() => {
  const map = new Map()
  for (const r of strengthSets.value) {
    if (!map.has(r.group_id)) {
      map.set(r.group_id, {
        group_id: r.group_id,
        date: r.date,
        exercise: r.exercise,
        created_at: r.created_at,
        sets: [],
      })
    }
    map.get(r.group_id).sets.push({ id: r.id, weight: r.weight, reps: r.reps, set_order: r.set_order })
  }
  const arr = [...map.values()]
  arr.forEach((g) => g.sets.sort((a, b) => a.set_order - b.set_order))
  arr.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.created_at < b.created_at ? 1 : -1))
  return arr
})

// ---- 重訓 ----
async function addStrength({ date, exercise, sets }) {
  const { data: { user } } = await supabase.auth.getUser()
  const group_id = crypto.randomUUID()
  const rows = sets.map((s, i) => ({
    user_id: user.id,
    group_id,
    date,
    exercise,
    weight: s.weight,
    reps: s.reps,
    set_order: i + 1,
  }))
  const { error: e } = await supabase.from('strength_sets').insert(rows)
  if (e) throw e
  await loadAll()
}

async function updateStrength(group_id, { date, exercise, sets }) {
  const { data: { user } } = await supabase.auth.getUser()
  const del = await supabase.from('strength_sets').delete().eq('group_id', group_id)
  if (del.error) throw del.error
  const rows = sets.map((s, i) => ({
    user_id: user.id,
    group_id,
    date,
    exercise,
    weight: s.weight,
    reps: s.reps,
    set_order: i + 1,
  }))
  const { error: e } = await supabase.from('strength_sets').insert(rows)
  if (e) throw e
  await loadAll()
}

async function removeStrengthGroup(group_id) {
  const { error: e } = await supabase.from('strength_sets').delete().eq('group_id', group_id)
  if (e) throw e
  strengthSets.value = strengthSets.value.filter((r) => r.group_id !== group_id)
}

// ---- 有氧（沿用 workouts 表）----
async function addCardio(fields) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error: e } = await supabase.from('workouts').insert({ ...fields, user_id: user.id })
  if (e) throw e
  await loadAll()
}

async function updateCardio(id, fields) {
  const { error: e } = await supabase.from('workouts').update(fields).eq('id', id)
  if (e) throw e
  await loadAll()
}

async function removeCardio(id) {
  const { error: e } = await supabase.from('workouts').delete().eq('id', id)
  if (e) throw e
  cardio.value = cardio.value.filter((c) => c.id !== id)
}

export function useLog() {
  return {
    strengthSets,
    strengthGroups,
    cardio,
    loading,
    error,
    loadAll,
    addStrength,
    updateStrength,
    removeStrengthGroup,
    addCardio,
    updateCardio,
    removeCardio,
  }
}

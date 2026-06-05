<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const emit = defineEmits(['added'])

const today = new Date().toISOString().slice(0, 10)

const form = ref({
  date: today,
  type: '跑步',
  duration: null,
  distance: null,
  note: '',
})
const saving = ref(false)
const error = ref('')

const types = ['跑步', '健走', '騎車', '游泳', '重訓', '瑜珈', '球類', '其他']

async function save() {
  error.value = ''
  saving.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { error: e } = await supabase.from('workouts').insert({
      user_id: user.id,
      date: form.value.date,
      type: form.value.type,
      duration: form.value.duration,
      distance: form.value.distance,
      note: form.value.note,
    })
    if (e) throw e
    // 重設表單（保留日期與類型，方便連續輸入）
    form.value.duration = null
    form.value.distance = null
    form.value.note = ''
    emit('added')
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="card">
    <h2>新增運動紀錄</h2>
    <form @submit.prevent="save">
      <div class="row">
        <div>
          <label>日期</label>
          <input v-model="form.date" type="date" required />
        </div>
        <div>
          <label>運動類型</label>
          <select v-model="form.type">
            <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div>
          <label>時長（分鐘）</label>
          <input v-model.number="form.duration" type="number" min="0" placeholder="例如 30" />
        </div>
        <div>
          <label>距離（公里，可空）</label>
          <input v-model.number="form.distance" type="number" min="0" step="0.1" placeholder="例如 5" />
        </div>
      </div>

      <label>備註</label>
      <textarea v-model="form.note" rows="2" placeholder="今天感覺如何…"></textarea>

      <button type="submit" :disabled="saving">
        {{ saving ? '儲存中…' : '新增紀錄' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

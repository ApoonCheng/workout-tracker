<script setup>
import { ref, watch, computed } from 'vue'
import { useWorkouts } from '../composables/useWorkouts'

const props = defineProps({
  // 傳入要編輯的紀錄物件；null 代表新增模式
  editing: { type: Object, default: null },
})
const emit = defineEmits(['done', 'cancel'])

const { addWorkout, updateWorkout } = useWorkouts()

const today = new Date().toISOString().slice(0, 10)
const types = ['跑步', '健走', '騎車', '游泳', '重訓', '瑜珈', '球類', '其他']

const isEditing = computed(() => !!props.editing)

function blank() {
  return { date: today, type: '跑步', duration: null, distance: null, note: '' }
}
const form = ref(blank())
const saving = ref(false)
const error = ref('')

// 切換到編輯模式時，把該筆資料帶進表單
watch(
  () => props.editing,
  (val) => {
    if (val) {
      form.value = {
        date: val.date,
        type: val.type,
        duration: val.duration,
        distance: val.distance,
        note: val.note ?? '',
      }
    } else {
      form.value = blank()
    }
  },
  { immediate: true }
)

async function save() {
  error.value = ''
  saving.value = true
  try {
    const fields = {
      date: form.value.date,
      type: form.value.type,
      duration: form.value.duration,
      distance: form.value.distance,
      note: form.value.note,
    }
    if (isEditing.value) {
      await updateWorkout(props.editing.id, fields)
    } else {
      await addWorkout(fields)
      // 新增後保留日期與類型，方便連續輸入
      form.value.duration = null
      form.value.distance = null
      form.value.note = ''
    }
    emit('done')
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="card">
    <h2>{{ isEditing ? '✏️ 編輯紀錄' : '新增運動紀錄' }}</h2>
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

      <div class="row" style="gap: 8px">
        <button type="submit" :disabled="saving">
          {{ saving ? '儲存中…' : isEditing ? '儲存修改' : '新增紀錄' }}
        </button>
        <button v-if="isEditing" type="button" class="ghost" @click="emit('cancel')">
          取消
        </button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

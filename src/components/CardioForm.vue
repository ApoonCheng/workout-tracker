<script setup>
import { ref, watch, computed } from 'vue'
import { useLog } from '../composables/useLog'
import { todayStr } from '../lib/date'

const props = defineProps({
  editing: { type: Object, default: null },
  presetDate: { type: String, default: null },
})
const emit = defineEmits(['done', 'cancel'])

const { addCardio, updateCardio } = useLog()

const isEditing = computed(() => !!props.editing)
const types = ['跑步', '健走', '騎車', '游泳', '跳繩', '飛輪', '其他']

const form = ref({ date: todayStr(), type: '跑步', duration: null, distance: null, note: '' })
const saving = ref(false)
const error = ref('')

watch(
  () => [props.editing, props.presetDate],
  () => {
    if (props.editing) {
      const e = props.editing
      form.value = {
        date: e.date,
        type: e.type,
        duration: e.duration,
        distance: e.distance,
        note: e.note ?? '',
      }
    } else {
      form.value = { date: props.presetDate || todayStr(), type: '跑步', duration: null, distance: null, note: '' }
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
    if (isEditing.value) await updateCardio(props.editing.id, fields)
    else await addCardio(fields)
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
    <h2>{{ isEditing ? '✏️ 編輯有氧' : '🏃 新增有氧' }}</h2>
    <form @submit.prevent="save">
      <div class="row">
        <div>
          <label>日期</label>
          <input v-model="form.date" type="date" required />
        </div>
        <div>
          <label>類型</label>
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
          {{ saving ? '儲存中…' : isEditing ? '儲存修改' : '新增' }}
        </button>
        <button type="button" class="ghost" @click="emit('cancel')">取消</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

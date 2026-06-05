<script setup>
import { ref, watch, computed } from 'vue'
import { useLog } from '../composables/useLog'
import { todayStr } from '../lib/date'

const props = defineProps({
  editing: { type: Object, default: null },
  presetDate: { type: String, default: null },
})
const emit = defineEmits(['done', 'cancel'])

const { addStrength, updateStrength, strengthGroups } = useLog()

const isEditing = computed(() => !!props.editing)

const commonExercises = [
  '臥推', '深蹲', '硬舉', '肩推', '引體向上', '滑輪下拉',
  '坐姿划船', '二頭彎舉', '三頭下壓', '腿推', '腿伸屈', '飛鳥',
]
const exerciseSuggestions = computed(() => {
  const used = strengthGroups.value.map((g) => g.exercise)
  return [...new Set([...used, ...commonExercises])]
})

const date = ref(todayStr())
const exercise = ref('')
const sets = ref([{ weight: null, reps: null }])
const saving = ref(false)
const error = ref('')

watch(
  () => [props.editing, props.presetDate],
  () => {
    if (props.editing) {
      date.value = props.editing.date
      exercise.value = props.editing.exercise
      sets.value = props.editing.sets.map((s) => ({ weight: s.weight, reps: s.reps }))
      if (!sets.value.length) sets.value = [{ weight: null, reps: null }]
    } else {
      date.value = props.presetDate || todayStr()
      exercise.value = ''
      sets.value = [{ weight: null, reps: null }]
    }
  },
  { immediate: true }
)

function addSet() {
  const last = sets.value[sets.value.length - 1] || { weight: null, reps: null }
  sets.value.push({ weight: last.weight, reps: last.reps }) // 自動帶入上一組
}
function removeSet(i) {
  if (sets.value.length > 1) sets.value.splice(i, 1)
}

async function save() {
  error.value = ''
  if (!exercise.value.trim()) {
    error.value = '請輸入動作名稱'
    return
  }
  const valid = sets.value.filter((s) => s.reps != null && s.reps !== '')
  if (!valid.length) {
    error.value = '至少要有一組填入次數'
    return
  }
  saving.value = true
  try {
    const payload = { date: date.value, exercise: exercise.value.trim(), sets: valid }
    if (isEditing.value) await updateStrength(props.editing.group_id, payload)
    else await addStrength(payload)
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
    <h2>{{ isEditing ? '✏️ 編輯重訓' : '💪 新增重訓' }}</h2>
    <form @submit.prevent="save">
      <div class="row">
        <div>
          <label>日期</label>
          <input v-model="date" type="date" required />
        </div>
        <div>
          <label>動作</label>
          <input v-model="exercise" list="exercise-list" placeholder="例如 臥推" required />
          <datalist id="exercise-list">
            <option v-for="e in exerciseSuggestions" :key="e" :value="e" />
          </datalist>
        </div>
      </div>

      <label>每組（重量 kg × 次數）</label>
      <div v-for="(s, i) in sets" :key="i" class="set-row">
        <span class="set-no">{{ i + 1 }}</span>
        <input v-model.number="s.weight" type="number" min="0" step="0.5" placeholder="kg" />
        <span class="x">×</span>
        <input v-model.number="s.reps" type="number" min="0" placeholder="次" />
        <button type="button" class="rm" @click="removeSet(i)" :disabled="sets.length === 1">✕</button>
      </div>

      <button type="button" class="add-set" @click="addSet">＋ 加一組</button>

      <div class="row" style="gap: 8px; margin-top: 4px">
        <button type="submit" :disabled="saving">
          {{ saving ? '儲存中…' : isEditing ? '儲存修改' : '新增' }}
        </button>
        <button type="button" class="ghost" @click="emit('cancel')">取消</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<style scoped>
.set-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.set-no {
  flex: 0 0 24px; height: 24px; border-radius: 50%;
  background: #f3e8ff; color: #7c3aed; font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center; font-weight: 600;
}
.set-row input { margin-bottom: 0; }
.x { color: #b8a9cf; }
.rm {
  flex: 0 0 auto; background: transparent; color: #c4b5d6;
  padding: 4px 6px; font-size: 0.9rem;
}
.rm:hover { background: #fdf2f8; color: #e11d57; }
.rm:disabled { opacity: 0.3; cursor: default; }
.add-set {
  width: 100%; background: #f3e8ff; color: #7c3aed;
  border: 1px dashed #d8b4fe; margin: 4px 0 12px;
}
.add-set:hover { background: #ede0ff; }
</style>

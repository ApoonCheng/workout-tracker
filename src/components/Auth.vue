<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const email = ref('')
const password = ref('')
const isSignUp = ref(false)
const loading = ref(false)
const message = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  message.value = ''
  loading.value = true
  try {
    if (isSignUp.value) {
      const { error: e } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (e) throw e
      message.value = '註冊成功！如果有開啟信箱驗證，請去收信點確認連結。'
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (e) throw e
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card">
    <h2>{{ isSignUp ? '註冊新帳號' : '登入' }}</h2>
    <form @submit.prevent="submit">
      <label>Email</label>
      <input v-model="email" type="email" required placeholder="you@example.com" />

      <label>密碼</label>
      <input v-model="password" type="password" required minlength="6" placeholder="至少 6 個字" />

      <button type="submit" :disabled="loading">
        {{ loading ? '處理中…' : isSignUp ? '註冊' : '登入' }}
      </button>
    </form>

    <p v-if="message" class="muted">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <p class="muted" style="margin-top: 16px">
      {{ isSignUp ? '已經有帳號了？' : '還沒有帳號？' }}
      <button class="ghost" @click="isSignUp = !isSignUp">
        {{ isSignUp ? '改為登入' : '改為註冊' }}
      </button>
    </p>
  </div>
</template>

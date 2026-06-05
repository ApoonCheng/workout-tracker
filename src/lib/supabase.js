import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  alert('還沒設定 Supabase 金鑰，請複製 .env.example 為 .env 並填入金鑰')
}

export const supabase = createClient(url, anonKey)

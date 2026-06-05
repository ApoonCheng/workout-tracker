# 🏃 運動歷程紀錄

用 Vue 3 + Supabase 做的個人運動紀錄網站。可以註冊登入、新增/查看/刪除自己的運動紀錄，每個人只看得到自己的資料。

---

## 一、設定 Supabase（資料庫，免費）

1. 到 [supabase.com](https://supabase.com) 用 GitHub 或 Email 註冊
2. 點 **New project**，取個名字、設一個資料庫密碼（自己記著），地區選離你近的（例如 Singapore），按建立，等 1～2 分鐘
3. 進專案後，左側選 **SQL Editor** → **New query**
4. 打開本專案的 `supabase_setup.sql`，整段複製貼上，按 **Run**（這會建好資料表和權限）
5. 左側 **Project Settings**（齒輪）→ **API**，記下兩個值：
   - **Project URL**
   - **anon public** key

> 預設新註冊會寄驗證信。若想測試方便，可到 **Authentication → Providers → Email** 把 “Confirm email” 關掉，註冊後就能直接登入。

## 二、填入金鑰

1. 把 `.env.example` 複製一份，改名為 `.env`
2. 填入剛剛的兩個值：

```
VITE_SUPABASE_URL=你的 Project URL
VITE_SUPABASE_ANON_KEY=你的 anon public key
```

## 三、本機執行

```powershell
npm install
npm run dev
```

打開終端機顯示的網址（通常是 http://localhost:5173），就能註冊、登入、開始記錄運動。

---

## 四、部署到網路上（Vercel，免費）

1. 把這個資料夾推到 GitHub：

   ```powershell
   git init
   git add .
   git commit -m "運動歷程紀錄"
   git branch -M main
   git remote add origin https://github.com/你的帳號/workout-tracker.git
   git push -u origin main
   ```

2. 到 [vercel.com](https://vercel.com) 用 GitHub 登入 → **Add New → Project** → 選這個 repo
3. Vercel 會自動偵測是 Vite 專案。在 **Environment Variables** 加上跟 `.env` 一樣的兩個變數：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 按 **Deploy**，完成後會給你一個網址，手機電腦都能開。

> 之後只要 `git push`，Vercel 就會自動重新部署。

---

## 檔案結構

```
workout-tracker/
├─ index.html
├─ supabase_setup.sql        # 建資料庫的 SQL
├─ .env.example              # 金鑰範本（複製成 .env）
├─ src/
│  ├─ main.js
│  ├─ App.vue                # 主畫面（依登入狀態切換）
│  ├─ style.css
│  ├─ lib/supabase.js        # Supabase 連線
│  └─ components/
│     ├─ Auth.vue            # 註冊／登入
│     ├─ WorkoutForm.vue     # 新增紀錄
│     └─ WorkoutList.vue     # 歷史列表 + 刪除
└─ ...
```

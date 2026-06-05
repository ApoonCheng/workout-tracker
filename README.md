# 🏃 運動歷程紀錄

用 Vue 3 + Supabase 做的個人運動紀錄 PWA。可以註冊登入、記錄與分析自己的運動，每個人只看得到自己的資料，還能安裝到手機桌面、離線使用。

## ✨ 功能

- **帳號系統**：Email 註冊／登入，登入狀態長期保留（關掉重開不用再登入）
- **紀錄管理**：新增、編輯（彈窗）、刪除運動紀錄（日期、類型、時長、距離、備註）
- **統計面板**：總次數／分鐘／公里／運動天數，可切換 **全部 / 本月 / 本週**
- **月曆熱力圖**：依當天運動時長深淺上色，可切換月份；
  - 點**有紀錄**的日子 → 列表只看那天
  - 點**空白**的日子 → 快速新增（自動帶日期）
- **連續天數徽章** 🔥：今天還沒運動不會馬上算斷（從昨天起算）
- **最近 7 天**長條圖、**運動類型分布**橫條圖
- **匯出 CSV**：一鍵下載，Excel 開中文不亂碼
- **PWA**：可安裝到手機/電腦桌面，獨立視窗、離線可開

---

## 一、設定 Supabase（資料庫，免費）

1. 到 [supabase.com](https://supabase.com) 用 GitHub 或 Email 註冊
2. 點 **New project**，取個名字、設一個資料庫密碼（自己記著），地區選離你近的（例如 Singapore），按建立，等 1～2 分鐘
3. 進專案後，左側選 **SQL Editor** → **New query**
4. 打開本專案的 `supabase_setup.sql`，整段複製貼上，按 **Run**（這會建好資料表和權限）
5. 左側 **Project Settings**（齒輪）→ **API**，記下兩個值：
   - **Project URL**（注意：只要主網址，結尾不要加 `/rest/v1/` 之類的路徑）
   - **anon public** key

> 預設新註冊會寄驗證信。若想測試方便，可到 **Authentication → Providers → Email** 把 “Confirm email” 關掉，註冊後就能直接登入。

## 二、填入金鑰

1. 把 `.env.example` 複製一份，改名為 `.env`
2. 填入剛剛的兩個值：

```
VITE_SUPABASE_URL=你的 Project URL
VITE_SUPABASE_ANON_KEY=你的 anon public key
```

> 改完 `.env` 一定要**重新啟動** `npm run dev` 才會生效。

## 三、本機執行

```powershell
npm install
npm run dev
```

打開終端機顯示的網址（通常是 http://localhost:5173），就能註冊、登入、開始記錄運動。

> PWA 的安裝／離線功能只有在正式部署（HTTPS）才會完整啟用，本機 dev 不一定看得到安裝提示。

---

## 四、部署到網路上（Vercel，免費）

1. 把這個資料夾推到 GitHub（`你的帳號` 換成自己的）：

   ```powershell
   git init
   git add .
   git commit -m "運動歷程紀錄"
   git branch -M main
   git remote add origin https://github.com/你的帳號/workout-tracker.git
   git push -u origin main
   ```

2. 到 [vercel.com](https://vercel.com) 用 GitHub 登入 → **Add New → Project** → 選這個 repo
3. Vercel 會自動偵測是 Vite 專案。在 **Environment Variables** 加上跟 `.env` 一樣的兩個變數（左邊填名稱、右邊填值）：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 按 **Deploy**，完成後會給你一個網址，手機電腦都能開。

> 之後只要 `git push`，Vercel 就會自動重新部署。

---

## 五、安裝到手機 📱（部署後）

用手機瀏覽器開你的 Vercel 網址：

- **iPhone / Safari**：分享鈕 → **加入主畫面**
- **Android / Chrome**：選單 → **安裝應用程式**（或網址列的安裝圖示）

裝好後桌面會出現 App 圖示，點開是獨立視窗，登入狀態保留，離線也能開。

---

## 檔案結構

```
workout-tracker/
├─ index.html                 # 含 PWA / iOS meta
├─ supabase_setup.sql         # 建資料庫的 SQL（含權限 RLS）
├─ .env.example               # 金鑰範本（複製成 .env）
├─ scripts/
│  └─ gen-icons.mjs           # 產生 PWA 圖示（純 Node）
├─ public/                    # PWA 圖示 png
├─ src/
│  ├─ main.js
│  ├─ App.vue                 # 主畫面（登入狀態、彈窗、月曆篩選）
│  ├─ style.css
│  ├─ lib/
│  │  ├─ supabase.js          # Supabase 連線（持久登入）
│  │  ├─ csv.js               # 匯出 CSV
│  │  └─ date.js              # 本地日期工具（避免 UTC 跨日）
│  ├─ composables/
│  │  └─ useWorkouts.js       # 共用資料邏輯（增刪改查）
│  └─ components/
│     ├─ Auth.vue             # 註冊／登入
│     ├─ Dashboard.vue        # 統計面板 + 月曆 + 圖表 + 匯出
│     ├─ WorkoutForm.vue      # 新增／編輯表單
│     ├─ WorkoutList.vue      # 歷史列表（可依日期篩選）
│     └─ Modal.vue            # 通用彈窗
└─ vite.config.js             # Vite + PWA 設定
```

---

## 技術

Vue 3（`<script setup>`）· Vite · Supabase（Auth + PostgreSQL + RLS）· vite-plugin-pwa · 部署於 Vercel

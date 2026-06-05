// 把運動紀錄陣列轉成 CSV 並觸發瀏覽器下載
export function exportWorkoutsCsv(workouts) {
  const headers = ['日期', '類型', '時長(分)', '距離(km)', '備註']
  const rows = workouts.map((w) => [
    w.date,
    w.type,
    w.duration ?? '',
    w.distance ?? '',
    w.note ?? '',
  ])

  const escape = (v) => {
    const s = String(v)
    // 含逗號、引號、換行時用雙引號包起來
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }

  const csv = [headers, ...rows]
    .map((r) => r.map(escape).join(','))
    .join('\r\n')

  // 加 BOM 讓 Excel 正確顯示中文
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `運動紀錄_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

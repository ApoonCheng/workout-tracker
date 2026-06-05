function download(filename, rows) {
  const escape = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const csv = rows.map((r) => r.map(escape).join(',')).join('\r\n')
  // 加 BOM 讓 Excel 正確顯示中文
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 匯出重訓：每一組一列
export function exportStrengthCsv(groups) {
  const rows = [['日期', '動作', '第幾組', '重量(kg)', '次數']]
  for (const g of groups) {
    g.sets.forEach((s, i) => {
      rows.push([g.date, g.exercise, i + 1, s.weight ?? '', s.reps ?? ''])
    })
  }
  download(`重訓紀錄_${new Date().toISOString().slice(0, 10)}.csv`, rows)
}

// 匯出有氧
export function exportCardioCsv(cardio) {
  const rows = [['日期', '類型', '時長(分)', '距離(km)', '備註']]
  for (const c of cardio) rows.push([c.date, c.type, c.duration ?? '', c.distance ?? '', c.note ?? ''])
  download(`有氧紀錄_${new Date().toISOString().slice(0, 10)}.csv`, rows)
}

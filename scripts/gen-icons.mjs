// 純 Node 產生 App 圖示 PNG（不需額外繪圖套件）
// 圖示：藍底 + 白色圓環（像運動標靶／獎牌）
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function makePng(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  let p = 0
  for (let y = 0; y < size; y++) {
    raw[p++] = 0 // filter type 0
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y, size)
      raw[p++] = r
      raw[p++] = g
      raw[p++] = b
      raw[p++] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// 藍底 + 置中白色圓環（全幅，maskable 安全）
function iconPixel(x, y, size) {
  const cx = size / 2
  const cy = size / 2
  const d = Math.hypot(x - cx, y - cy)
  const outer = size * 0.3
  const inner = size * 0.19
  if (d <= outer && d >= inner) return [255, 255, 255, 255] // 白環
  return [37, 99, 235, 255] // #2563eb 藍底
}

mkdirSync('public', { recursive: true })
for (const size of [192, 512, 180]) {
  const name = size === 180 ? 'apple-touch-icon.png' : `pwa-${size}.png`
  writeFileSync(`public/${name}`, makePng(size, iconPixel))
  console.log('已產生 public/' + name)
}

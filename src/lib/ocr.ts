import { createWorker } from 'tesseract.js'

// In Tesseract.js v5, pass options as the SECOND argument.
const WORKER_OPTS = {
  workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
  langPath: 'https://tessdata.projectnaptha.com/5',
  corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/dist/tesseract-core.wasm.js',
} as const

let worker: any | null = null

async function getWorker() {
  if (worker) return worker
  // Pass undefined for langs, and WORKER_OPTS as the options param
  worker = await createWorker(undefined, WORKER_OPTS as any)
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  return worker
}

export async function ocrCode(blob: Blob) {
  const w = await getWorker()
  await w.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    preserve_interword_spaces: '1',
    user_defined_dpi: '300'
  })
  const { data } = await w.recognize(blob, { rectangle: undefined })
  const text = (data.text || '').toUpperCase().replace(/\s+/g, ' ').trim()
  const conf = data.confidence / 100
  return { text, confidence: conf }
}

export async function ocrAddress(blob: Blob) {
  const w = await getWorker()
  await w.setParameters({
    tessedit_char_whitelist: undefined,
    preserve_interword_spaces: '1',
    user_defined_dpi: '300'
  })
  const { data } = await w.recognize(blob)
  const text = (data.text || '').replace(/[ \t]+\n/g, '\n').trim()
  const conf = data.confidence / 100
  return { text, confidence: conf }
}

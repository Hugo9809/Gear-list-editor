#!/usr/bin/env node
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const inputSvg = path.resolve(__dirname, '../public/icons/icon.svg')
  let svgBuffer
  try {
    svgBuffer = await fs.readFile(inputSvg)
  } catch (err) {
    console.error(`Failed to read SVG at ${inputSvg}:`, err)
    process.exit(1)
  }

  const outDir = path.resolve(__dirname, '../public/icons')
  await fs.mkdir(outDir, { recursive: true })

  const icons = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'icon-192x192.png', size: 192 },
    { name: 'icon-256x256.png', size: 256 },
    { name: 'icon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 }
  ]

  for (const icon of icons) {
    const outPath = path.resolve(outDir, icon.name)
    try {
      await sharp(svgBuffer)
        .resize(icon.size, icon.size, { fit: 'contain' })
        .png({ compressionLevel: 9, adaptiveFiltering: false })
        .toFile(outPath)
      console.log(`Generated ${icon.name} (${icon.size}x${icon.size})`)
    } catch (err) {
      console.error(`Failed to generate ${icon.name}:`, err)
    }
  }
}

main().catch((err) => {
  console.error('Fatal error generating favicons:', err)
  process.exit(1)
})

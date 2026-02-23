/**
 * POST /api/upload
 * Nahrávání obrázků do CMS
 */

import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, extname } from 'path'
import { requireEditor } from '@/server/utils/auth'
import { defineApiHandler, createValidationError } from '@/server/utils/errors'

// Povolené typy obrázků
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

// Mapování MIME typů na přípony
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

export default defineEventHandler(
  defineApiHandler(async (event) => {
    // Vyžadovat editor nebo admin roli
    requireEditor(event)

    // Přečíst multipart form data
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createValidationError('Nebyl nahrán žádný soubor')
    }

    const file = formData.find(f => f.name === 'file')

    if (!file) {
      throw createValidationError('Soubor nebyl nalezen v požadavku')
    }

    if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
      throw createValidationError(
        `Nepodporovaný typ souboru. Povolené typy: ${ALLOWED_TYPES.join(', ')}`
      )
    }

    if (file.data.length > MAX_FILE_SIZE) {
      throw createValidationError(
        `Soubor je příliš velký. Maximální velikost: ${MAX_FILE_SIZE / 1024 / 1024} MB`
      )
    }

    // Vytvořit složku pro uploady pokud neexistuje
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generovat unikátní název souboru
    const ext = MIME_TO_EXT[file.type] || extname(file.filename || '') || '.jpg'
    const filename = `${randomUUID()}${ext}`
    const filepath = join(uploadsDir, filename)

    // Uložit soubor
    await writeFile(filepath, file.data)

    // Vrátit cestu k souboru (relativní URL)
    return {
      url: `/uploads/${filename}`,
      filename,
      size: file.data.length,
      type: file.type,
    }
  })
)

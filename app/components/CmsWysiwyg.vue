<template>
  <div class="cms-wysiwyg">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>

    <!-- Scrollable editor wrapper -->
    <div class="max-h-[70vh] overflow-y-auto border border-gray-300 rounded-lg">
      <!-- Toolbar -->
      <div v-if="editor" class="sticky top-0 z-10 flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
      <!-- Text formatting -->
      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
        title="Tučné"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
        </svg>
      </button>

      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
        title="Kurzíva"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4m-2 0v16m-6 0h8" transform="skewX(-12)" />
        </svg>
      </button>

      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()"
        title="Podtržené"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4v6a6 6 0 0012 0V4M4 20h16" />
        </svg>
      </button>

      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
        title="Přeškrtnuté"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h12M9 4l-1 8m8-8l1 8" />
        </svg>
      </button>

      <div class="w-px bg-gray-300 mx-1"></div>

      <!-- Headings -->
      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors text-sm font-semibold"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        title="Nadpis 2"
      >
        H2
      </button>

      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors text-sm font-semibold"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        title="Nadpis 3"
      >
        H3
      </button>

      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors text-sm font-semibold"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('heading', { level: 4 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        title="Nadpis 4"
      >
        H4
      </button>

      <div class="w-px bg-gray-300 mx-1"></div>

      <!-- Lists -->
      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
        title="Odrážkový seznam"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="2" cy="6" r="1" fill="currentColor" />
          <circle cx="2" cy="12" r="1" fill="currentColor" />
          <circle cx="2" cy="18" r="1" fill="currentColor" />
        </svg>
      </button>

      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
        title="Číslovaný seznam"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6h13M7 12h13M7 18h13" />
          <text x="1" y="8" font-size="6" fill="currentColor">1</text>
          <text x="1" y="14" font-size="6" fill="currentColor">2</text>
          <text x="1" y="20" font-size="6" fill="currentColor">3</text>
        </svg>
      </button>

      <div class="w-px bg-gray-300 mx-1"></div>

      <!-- Text align -->
      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive({ textAlign: 'left' }) }"
        @click="editor.chain().focus().setTextAlign('left').run()"
        title="Zarovnat vlevo"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h14" />
        </svg>
      </button>

      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive({ textAlign: 'center' }) }"
        @click="editor.chain().focus().setTextAlign('center').run()"
        title="Zarovnat na střed"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M5 18h14" />
        </svg>
      </button>

      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive({ textAlign: 'right' }) }"
        @click="editor.chain().focus().setTextAlign('right').run()"
        title="Zarovnat vpravo"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 12h10M6 18h14" />
        </svg>
      </button>

      <div class="w-px bg-gray-300 mx-1"></div>

      <!-- Link -->
      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('link') }"
        @click="setLink"
        title="Odkaz"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>

      <button
        v-if="editor.isActive('link')"
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors text-red-500"
        @click="editor.chain().focus().unsetLink().run()"
        title="Odstranit odkaz"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </button>

      <div class="w-px bg-gray-300 mx-1"></div>

      <!-- Blockquote -->
      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('blockquote') }"
        @click="editor.chain().focus().toggleBlockquote().run()"
        title="Citace"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <!-- Horizontal rule -->
      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        @click="editor.chain().focus().setHorizontalRule().run()"
        title="Horizontální čára"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12h16" />
        </svg>
      </button>

      <div class="w-px bg-gray-300 mx-1"></div>

      <!-- Image upload -->
      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :class="{ 'opacity-50 cursor-not-allowed': uploading }"
        :disabled="uploading"
        @click="openImageUpload"
        title="Vložit obrázek"
      >
        <svg v-if="!uploading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </button>
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleImageUpload"
      />

      <!-- Image float options (when image selected) -->
      <template v-if="editor.isActive('image')">
        <div class="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          class="p-2 rounded hover:bg-gray-200 transition-colors text-xs"
          :class="{ 'bg-gray-200 text-plaza-600': !getImageFloat() }"
          @click="setImageFloat(null)"
          title="Obrázek na celou šířku"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="6" width="18" height="12" rx="2" stroke-width="2" />
          </svg>
        </button>
        <button
          type="button"
          class="p-2 rounded hover:bg-gray-200 transition-colors text-xs"
          :class="{ 'bg-gray-200 text-plaza-600': getImageFloat() === 'left' }"
          @click="setImageFloat('left')"
          title="Obrázek vlevo, text vpravo"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="8" height="8" rx="1" stroke-width="2" />
            <path stroke-linecap="round" stroke-width="2" d="M14 6h7M14 10h7M3 16h18M3 20h18" />
          </svg>
        </button>
        <button
          type="button"
          class="p-2 rounded hover:bg-gray-200 transition-colors text-xs"
          :class="{ 'bg-gray-200 text-plaza-600': getImageFloat() === 'right' }"
          @click="setImageFloat('right')"
          title="Obrázek vpravo, text vlevo"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="13" y="4" width="8" height="8" rx="1" stroke-width="2" />
            <path stroke-linecap="round" stroke-width="2" d="M3 6h7M3 10h7M3 16h18M3 20h18" />
          </svg>
        </button>
      </template>

      <div class="w-px bg-gray-300 mx-1"></div>

      <!-- Table -->
      <div ref="tableMenuWrapper" class="relative">
        <button
          type="button"
          class="p-2 rounded hover:bg-gray-200 transition-colors"
          :class="{ 'bg-gray-200 text-plaza-600': editor.isActive('table') }"
          @click="editor.isActive('table') ? toggleTableMenu() : insertTable()"
          title="Tabulka"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
          </svg>
        </button>

        <!-- Table dropdown menu -->
        <div
          v-if="showTableMenu && editor.isActive('table')"
          class="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2 min-w-[200px]"
        >
          <div class="text-xs font-semibold text-gray-500 px-2 py-1 border-b border-gray-200 mb-1">Úpravy tabulky</div>

          <div class="text-xs font-medium text-gray-400 px-2 py-1 mt-1">Sloupce</div>
          <button type="button" class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded" @click="tableAction('addColumnBefore')">
            + Přidat sloupec vlevo
          </button>
          <button type="button" class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded" @click="tableAction('addColumnAfter')">
            + Přidat sloupec vpravo
          </button>
          <button type="button" class="w-full text-left px-2 py-1.5 text-sm hover:bg-red-50 text-red-600 rounded" @click="tableAction('deleteColumn')">
            × Smazat sloupec
          </button>

          <div class="text-xs font-medium text-gray-400 px-2 py-1 mt-2">Řádky</div>
          <button type="button" class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded" @click="tableAction('addRowBefore')">
            + Přidat řádek nad
          </button>
          <button type="button" class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded" @click="tableAction('addRowAfter')">
            + Přidat řádek pod
          </button>
          <button type="button" class="w-full text-left px-2 py-1.5 text-sm hover:bg-red-50 text-red-600 rounded" @click="tableAction('deleteRow')">
            × Smazat řádek
          </button>

          <div class="text-xs font-medium text-gray-400 px-2 py-1 mt-2">Buňky</div>
          <button
            type="button"
            class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
            :class="{ 'opacity-50 cursor-not-allowed': !editor.can().mergeCells() }"
            :disabled="!editor.can().mergeCells()"
            @click="tableAction('mergeCells')"
          >
            Sloučit buňky
          </button>
          <button
            type="button"
            class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
            :class="{ 'opacity-50 cursor-not-allowed': !editor.can().splitCell() }"
            :disabled="!editor.can().splitCell()"
            @click="tableAction('splitCell')"
          >
            Rozdělit buňku
          </button>
          <button type="button" class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded" @click="tableAction('toggleHeaderCell')">
            Přepnout záhlaví
          </button>

          <div class="border-t border-gray-200 mt-2 pt-2">
            <button type="button" class="w-full text-left px-2 py-1.5 text-sm hover:bg-red-50 text-red-600 rounded" @click="tableAction('deleteTable')">
              🗑 Smazat celou tabulku
            </button>
          </div>
        </div>
      </div>

      <div class="w-px bg-gray-300 mx-1"></div>

      <!-- Undo/Redo -->
      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
        :disabled="!editor.can().undo()"
        @click="editor.chain().focus().undo().run()"
        title="Zpět"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>

      <button
        type="button"
        class="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
        :disabled="!editor.can().redo()"
        @click="editor.chain().focus().redo().run()"
        title="Vpřed"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
        </svg>
      </button>
      </div>

      <!-- Editor content -->
      <EditorContent
        :editor="editor"
        class="prose prose-sm max-w-none p-4 min-h-[200px] focus-within:ring-2 focus-within:ring-plaza-500 bg-white"
      />
    </div>

    <p v-if="hint" class="mt-1 text-xs text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

// Define extensions array once to avoid HMR duplication
const editorExtensions = [
  StarterKit.configure({
    // Ensure no conflicts with custom extensions
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-plaza-600 underline hover:text-plaza-800',
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'border-collapse border border-gray-300',
    },
  }),
  TableRow,
  TableHeader.configure({
    HTMLAttributes: {
      class: 'border border-gray-300 bg-gray-100 p-2 font-semibold text-left',
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: 'border border-gray-300 p-2',
    },
  }),
]

// Custom Image extension with style attribute support
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) {
            return {}
          }
          return { style: attributes.style }
        },
      },
    }
  },
})

const props = defineProps<{
  modelValue?: string
  label?: string
  hint?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { secureFetch } = useCmsAuth()
const imageInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const tableMenuWrapper = ref<HTMLElement | null>(null)

// Table menu state
const showTableMenu = ref(false)

const toggleTableMenu = () => {
  showTableMenu.value = !showTableMenu.value
}

// Close table menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (tableMenuWrapper.value && !tableMenuWrapper.value.contains(event.target as Node)) {
    showTableMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Table action helper
const tableAction = (action: string) => {
  if (!editor.value) return

  switch (action) {
    case 'addColumnBefore':
      editor.value.chain().focus().addColumnBefore().run()
      break
    case 'addColumnAfter':
      editor.value.chain().focus().addColumnAfter().run()
      break
    case 'deleteColumn':
      editor.value.chain().focus().deleteColumn().run()
      break
    case 'addRowBefore':
      editor.value.chain().focus().addRowBefore().run()
      break
    case 'addRowAfter':
      editor.value.chain().focus().addRowAfter().run()
      break
    case 'deleteRow':
      editor.value.chain().focus().deleteRow().run()
      break
    case 'mergeCells':
      editor.value.chain().focus().mergeCells().run()
      break
    case 'splitCell':
      editor.value.chain().focus().splitCell().run()
      break
    case 'toggleHeaderCell':
      editor.value.chain().focus().toggleHeaderCell().run()
      break
    case 'deleteTable':
      editor.value.chain().focus().deleteTable().run()
      showTableMenu.value = false
      break
  }
}

// Upload image to server
const uploadImage = async (file: File): Promise<string | null> => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    uploading.value = true
    const response = await secureFetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    return response.url
  } catch (error) {
    console.error('Image upload failed:', error)
    return null
  } finally {
    uploading.value = false
  }
}

// Insert image into editor
const insertImage = (url: string) => {
  editor.value?.chain().focus().setImage({ src: url }).run()
}

// Handle file input change
const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const url = await uploadImage(file)
  if (url) {
    insertImage(url)
  }

  // Reset input
  input.value = ''
}

// Open file dialog
const openImageUpload = () => {
  imageInput.value?.click()
}

// Handle paste event for images (sync check, async upload)
const handlePaste = (view: unknown, event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return false

  // Check if there's an image in clipboard
  let hasImage = false
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      hasImage = true
      const file = item.getAsFile()
      if (file) {
        // Upload asynchronously
        uploadImage(file).then((url) => {
          if (url) {
            insertImage(url)
          }
        })
      }
    }
  }

  // Only prevent default if we're handling an image
  // Return false for text paste to allow normal behavior
  return hasImage
}

// Handle drop event for images
const handleDrop = (view: unknown, event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return false

  let hasImage = false
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      hasImage = true
      // Upload asynchronously
      uploadImage(file).then((url) => {
        if (url) {
          insertImage(url)
        }
      })
    }
  }

  return hasImage
}

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    ...editorExtensions,
    CustomImage.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg',
      },
    }),
  ],
  editorProps: {
    handlePaste,
    handleDrop,
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue || '', false)
  }
})

// Set link
const setLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('URL odkazu:', previousUrl)

  // cancelled
  if (url === null) {
    return
  }

  // empty
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  // update link
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// Insert table
const insertTable = () => {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

// Get current image float
const getImageFloat = (): string | null => {
  if (!editor.value?.isActive('image')) return null
  const attrs = editor.value.getAttributes('image')
  if (attrs.style?.includes('float: left')) return 'left'
  if (attrs.style?.includes('float: right')) return 'right'
  return null
}

// Set image float
const setImageFloat = (float: 'left' | 'right' | null) => {
  if (!editor.value) return

  let style = ''

  if (float === 'left') {
    style = 'float: left; margin-right: 1rem; margin-bottom: 0.5rem; max-width: 50%;'
  } else if (float === 'right') {
    style = 'float: right; margin-left: 1rem; margin-bottom: 0.5rem; max-width: 50%;'
  }

  editor.value.chain().focus().updateAttributes('image', { style }).run()
}

// Cleanup
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
/* Basic editor styles */
.cms-wysiwyg .ProseMirror {
  outline: none;
  min-height: 180px;
}

.cms-wysiwyg .ProseMirror p {
  margin: 0.5em 0;
}

.cms-wysiwyg .ProseMirror h2,
.cms-wysiwyg .ProseMirror h3,
.cms-wysiwyg .ProseMirror h4 {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.cms-wysiwyg .ProseMirror h2 {
  font-size: 1.5em;
}

.cms-wysiwyg .ProseMirror h3 {
  font-size: 1.25em;
}

.cms-wysiwyg .ProseMirror h4 {
  font-size: 1.1em;
}

.cms-wysiwyg .ProseMirror ul,
.cms-wysiwyg .ProseMirror ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.cms-wysiwyg .ProseMirror ul {
  list-style-type: disc;
}

.cms-wysiwyg .ProseMirror ol {
  list-style-type: decimal;
}

.cms-wysiwyg .ProseMirror blockquote {
  border-left: 3px solid #e5e7eb;
  padding-left: 1em;
  margin: 0.5em 0;
  color: #6b7280;
}

.cms-wysiwyg .ProseMirror hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1em 0;
}

.cms-wysiwyg .ProseMirror a {
  color: #2563eb;
  text-decoration: underline;
}

.cms-wysiwyg .ProseMirror a:hover {
  color: #1d4ed8;
}

/* Images */
.cms-wysiwyg .ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 0.5em 0;
}

.cms-wysiwyg .ProseMirror img.ProseMirror-selectednode {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Floating images */
.cms-wysiwyg .ProseMirror img[style*="float: left"] {
  margin-right: 1rem;
  margin-bottom: 0.5rem;
}

.cms-wysiwyg .ProseMirror img[style*="float: right"] {
  margin-left: 1rem;
  margin-bottom: 0.5rem;
}

/* Tables */
.cms-wysiwyg .ProseMirror table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.cms-wysiwyg .ProseMirror th,
.cms-wysiwyg .ProseMirror td {
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  text-align: left;
  vertical-align: top;
}

.cms-wysiwyg .ProseMirror th {
  background-color: #f3f4f6;
  font-weight: 600;
}

.cms-wysiwyg .ProseMirror tr:hover td {
  background-color: #f9fafb;
}

.cms-wysiwyg .ProseMirror .selectedCell {
  background-color: #dbeafe;
}

.cms-wysiwyg .ProseMirror .column-resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #3b82f6;
  pointer-events: none;
}

.cms-wysiwyg .ProseMirror.resize-cursor {
  cursor: col-resize;
}

/* Clear floats after content */
.cms-wysiwyg .ProseMirror::after {
  content: "";
  display: table;
  clear: both;
}

/* Placeholder when empty */
.cms-wysiwyg .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}
</style>

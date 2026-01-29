/**
 * FormKit konfigurace
 * https://formkit.com/essentials/configuration
 */

import { cs, en } from '@formkit/i18n'
import { defaultConfig } from '@formkit/vue'
import { genesisIcons } from '@formkit/icons'
import { createProPlugin, inputs } from '@formkit/pro'

// Pro verzi - pokud máte licenci, odkomentujte
// const pro = createProPlugin('fk-xxx', inputs)

export default defaultConfig({
  locales: { cs, en },
  locale: 'cs',
  icons: { ...genesisIcons },
  config: {
    classes: {
      // Základní FormKit styly kompatibilní s Tailwind
      input: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plaza-500 focus:border-plaza-500 transition-colors',
      label: 'block text-sm font-medium text-gray-700 mb-1',
      help: 'text-xs text-gray-500 mt-1',
      message: 'text-xs text-red-600 mt-1',
      outer: 'mb-4',
      wrapper: '',
      inner: '',
    },
  },
  // plugins: [pro], // Odkomentujte pro FormKit Pro
})

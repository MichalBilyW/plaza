import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
	rules: {
		// Povolit console.log
		'no-console': 'off',

		// Vue pravidla
		'vue/no-v-html': 'off',
		'vue/multi-word-component-names': 'off',
		'vue/require-default-prop': 'off',
		'vue/attributes-order': 'off',
		'vue/html-self-closing': [
			'warn',
			{
				html: { void: 'always', normal: 'never', component: 'always' },
				svg: 'always',
				math: 'always',
			},
		],
	},
})

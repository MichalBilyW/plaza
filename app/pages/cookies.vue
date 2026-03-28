<template>
	<div class="min-h-screen">
		<!-- Dark header -->
		<div class="bg-gradient-to-b from-[#131313] to-[#1A1A1A] pt-20 pb-12">
			<h1
				class="text-center text-white font-heading font-black text-3xl md:text-4xl uppercase"
			>
				Zásady používání cookies
			</h1>
		</div>

		<!-- Content -->
		<div class="container-small px-4 py-12">
			<div class="prose prose-lg max-w-none">
				<h2>Co jsou cookies?</h2>
				<p>
					Cookies jsou malé textové soubory, které se ukládají do vašeho zařízení
					(počítače, tabletu nebo mobilního telefonu) při návštěvě webových stránek.
					Cookies pomáhají webovým stránkám zapamatovat si vaše preference a zlepšit váš
					uživatelský zážitek.
				</p>

				<h2>Jaké cookies používáme?</h2>

				<h3>Nezbytné cookies</h3>
				<p>
					Tyto cookies jsou nutné pro správné fungování webu a není možné je vypnout.
					Zajišťují například přihlášení nebo uložení vašich preferencí ochrany soukromí.
					Bez těchto cookies by web nefungoval správně.
				</p>

				<h3>Analytické cookies</h3>
				<p>
					Tyto cookies nám pomáhají zlepšovat naše stránky tím, že sledují, které stránky
					jsou nejnavštěvovanější a jak se návštěvníci po webu pohybují. Všechny
					informace, které tyto cookies shromažďují, jsou agregované a anonymní.
				</p>

				<h3>Reklamní a personalizační cookies</h3>
				<p>
					Tyto cookies umožňují další funkce a personalizaci pro lepší uživatelský
					zážitek. Mohou je nastavovat naši partneři a slouží k zobrazování relevantních
					reklam na základě vašich zájmů.
				</p>

				<h2>Jak spravovat cookies?</h2>
				<p>
					Svůj souhlas s cookies můžete kdykoliv změnit kliknutím na ikonu cookies v
					pravém dolním rohu stránky. Můžete také smazat cookies přímo v nastavení svého
					prohlížeče.
				</p>

				<h3>Nastavení v prohlížečích</h3>
				<ul>
					<li>
						<strong>Chrome:</strong> Nastavení → Soukromí a zabezpečení → Soubory cookie
					</li>
					<li>
						<strong>Firefox:</strong> Nastavení → Soukromí a zabezpečení → Cookies a
						data stránek
					</li>
					<li>
						<strong>Safari:</strong> Předvolby → Soukromí → Správa dat webových stránek
					</li>
					<li>
						<strong>Edge:</strong> Nastavení → Soubory cookie a oprávnění webu → Cookies
					</li>
				</ul>

				<h2>Změna nastavení cookies</h2>
				<p>Pro změnu vašich preferencí cookies klikněte na tlačítko níže:</p>

				<button
					type="button"
					class="inline-flex items-center justify-center px-6 py-3 bg-plaza text-white font-sans font-semibold rounded-[5px_20px_5px_5px] hover:bg-plaza/90 transition-colors"
					@click="openCookieSettings"
				>
					Upravit nastavení cookies
				</button>

				<h2>Kontakt</h2>
				<p>
					Pokud máte jakékoliv dotazy ohledně používání cookies na našem webu, kontaktujte
					nás na e-mailu uvedeném v sekci
					<NuxtLink to="/o-nas" class="text-plaza hover:underline">O nás</NuxtLink>.
				</p>

				<p class="text-sm text-plaza-gray mt-8">Poslední aktualizace: 1. 1. 2025</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const { openCookieSettings } = useCookieConsent()

usePlazaSeo({
	title: 'Zásady používání cookies',
	description:
		'Informace o tom, jak OC Plaza Liberec používá cookies na svých webových stránkách.',
})
</script>

<style scoped>
.prose h2 {
	@apply text-2xl font-heading font-bold text-plaza-dark mt-8 mb-4;
}

.prose h3 {
	@apply text-xl font-heading font-semibold text-plaza-dark mt-6 mb-3;
}

.prose p {
	@apply text-plaza-gray leading-relaxed mb-4;
}

.prose ul {
	@apply list-disc pl-6 mb-4 text-plaza-gray;
}

.prose li {
	@apply mb-2;
}
</style>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="text-2xl font-bold text-plaza-600">OC Plaza</span>
            <span class="text-gray-500">Liberec</span>
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink to="/obchody" class="text-gray-600 hover:text-plaza-600 transition-colors">
              Obchody
            </NuxtLink>
            <NuxtLink to="/akce" class="text-gray-600 hover:text-plaza-600 transition-colors">
              Akce a události
            </NuxtLink>
            <NuxtLink to="/sluzby" class="text-gray-600 hover:text-plaza-600 transition-colors">
              Služby
            </NuxtLink>
            <NuxtLink to="/kontakt" class="text-gray-600 hover:text-plaza-600 transition-colors">
              Kontakt
            </NuxtLink>
          </nav>

          <!-- Mobile menu button -->
          <button
            class="md:hidden p-2 rounded-lg hover:bg-gray-100"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!isMobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Mobile menu -->
        <nav v-if="isMobileMenuOpen" class="md:hidden py-4 border-t">
          <div class="flex flex-col gap-2">
            <NuxtLink
              to="/obchody"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              @click="isMobileMenuOpen = false"
            >
              Obchody
            </NuxtLink>
            <NuxtLink
              to="/akce"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              @click="isMobileMenuOpen = false"
            >
              Akce a události
            </NuxtLink>
            <NuxtLink
              to="/sluzby"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              @click="isMobileMenuOpen = false"
            >
              Služby
            </NuxtLink>
            <NuxtLink
              to="/kontakt"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              @click="isMobileMenuOpen = false"
            >
              Kontakt
            </NuxtLink>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-lg font-semibold mb-4">OC Plaza Liberec</h3>
            <p class="text-gray-400 text-sm">
              Vaše oblíbené nákupní centrum v srdci Liberce.
            </p>
          </div>

          <div>
            <h4 class="font-medium mb-4">Otevírací doba</h4>
            <div class="text-gray-400 text-sm space-y-1">
              <p>Po–Ne: 9:00 – 21:00</p>
              <p>Hypermarket: 7:00 – 22:00</p>
            </div>
          </div>

          <div>
            <h4 class="font-medium mb-4">Kontakt</h4>
            <div class="text-gray-400 text-sm space-y-1">
              <p>Dr. Milady Horákové 1015/108</p>
              <p>460 01 Liberec</p>
              <p class="mt-2">
                <a href="tel:+420123456789" class="hover:text-white">
                  +420 123 456 789
                </a>
              </p>
            </div>
          </div>

          <div>
            <h4 class="font-medium mb-4">Sledujte nás</h4>
            <div class="flex gap-4">
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {{ new Date().getFullYear() }} OC Plaza Liberec. Všechna práva vyhrazena.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const isMobileMenuOpen = ref(false)
</script>

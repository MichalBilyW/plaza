<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white flex-shrink-0">
      <div class="p-6">
        <NuxtLink to="/cms" class="flex items-center gap-2">
          <span class="text-xl font-bold text-plaza-400">Plaza CMS</span>
        </NuxtLink>
      </div>

      <nav class="mt-6">
        <div class="px-3 space-y-1">
          <NuxtLink
            to="/cms"
            class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
            :class="{ 'bg-gray-800': $route.path === '/cms' }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </NuxtLink>

          <NuxtLink
            to="/cms/obchody"
            class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
            :class="{ 'bg-gray-800': $route.path.startsWith('/cms/obchody') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Obchody
          </NuxtLink>

          <NuxtLink
            to="/cms/akce"
            class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
            :class="{ 'bg-gray-800': $route.path.startsWith('/cms/akce') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Akce a události
          </NuxtLink>

          <NuxtLink
            to="/cms/kategorie"
            class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
            :class="{ 'bg-gray-800': $route.path.startsWith('/cms/kategorie') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Kategorie
          </NuxtLink>

          <NuxtLink
            to="/cms/sluzby"
            class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
            :class="{ 'bg-gray-800': $route.path.startsWith('/cms/sluzby') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Služby
          </NuxtLink>

          <NuxtLink
            v-if="isAdmin"
            to="/cms/uzivatele"
            class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
            :class="{ 'bg-gray-800': $route.path.startsWith('/cms/uzivatele') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Uživatelé
          </NuxtLink>
        </div>
      </nav>

      <!-- User info -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 w-64">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-plaza-600 flex items-center justify-center text-sm font-medium">
            {{ user?.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ user?.name }}</p>
            <p class="text-xs text-gray-400">{{ user?.role === 'admin' ? 'Administrátor' : 'Editor' }}</p>
          </div>
          <button
            @click="logout"
            class="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Odhlásit se"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 bg-gray-100 min-h-screen overflow-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, isAdmin, logout } = useCmsAuth()
</script>

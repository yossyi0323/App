<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>営業準備業務</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          link
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from 'vuetify'

const drawer = ref(true)
const theme = useTheme()
const isDark = ref(theme.global.current.value.dark)

const menuItems = [
  { title: 'トップページ', to: '/', icon: 'mdi-home' },
  { title: '在庫確認業務', to: '/inventory', icon: 'mdi-clipboard-check' },
  { title: '補充（移動）業務', to: '/replenishment', icon: 'mdi-arrow-right-bold' },
  { title: '補充（作成）業務', to: '/creation', icon: 'mdi-cog' },
  { title: '発注依頼業務', to: '/order', icon: 'mdi-shopping' },
  { title: '営業準備状況一覧', to: '/status', icon: 'mdi-view-dashboard' },
]

const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
}
</script>

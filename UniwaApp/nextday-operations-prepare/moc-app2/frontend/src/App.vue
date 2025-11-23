<template>
   <MainLayout> <RouterView :key="route.path" /> </MainLayout>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';

const route = useRoute();
</script>


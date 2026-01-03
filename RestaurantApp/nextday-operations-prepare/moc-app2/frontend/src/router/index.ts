import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('@/views/InventoryView.vue'),
    },
    {
      path: '/replenishment',
      name: 'replenishment',
      component: () => import('@/views/ReplenishmentView.vue'),
    },
    {
      path: '/creation',
      name: 'creation',
      component: () => import('@/views/CreationView.vue'),
    },
    {
      path: '/order',
      name: 'order',
      component: () => import('@/views/OrderView.vue'),
    },
    {
      path: '/status',
      name: 'status',
      component: () => import('@/views/StatusView.vue'),
    },
  ],
});

export default router;

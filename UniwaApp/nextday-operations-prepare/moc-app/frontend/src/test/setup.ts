import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Vuetify components
const mockVuetifyComponents = {
  VCard: { template: '<div class="v-card"><slot /></div>' },
  VCardTitle: { template: '<div class="v-card-title"><slot /></div>' },
  VCardText: { template: '<div class="v-card-text"><slot /></div>' },
  VTextField: { 
    template: '<input class="v-text-field" />',
    props: ['modelValue', 'label', 'type', 'rules']
  },
  VTextarea: { 
    template: '<textarea class="v-textarea" />',
    props: ['modelValue', 'label']
  },
  VCheckbox: { 
    template: '<input type="checkbox" class="v-checkbox" />',
    props: ['modelValue', 'label']
  },
  VAlert: { template: '<div class="v-alert"><slot /></div>' },
  VIcon: { template: '<i class="v-icon" />' },
  VBtn: { template: '<button class="v-btn"><slot /></button>' },
  VCardActions: { template: '<div class="v-card-actions"><slot /></div>' },
  VCol: { template: '<div class="v-col"><slot /></div>' },
  VRow: { template: '<div class="v-row"><slot /></div>' },
  VSpacer: { template: '<div class="v-spacer" />' }
}

// Global component registration
config.global.components = mockVuetifyComponents

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  })),
  useRoute: vi.fn(() => ({
    params: {},
    query: {},
    path: '/',
    name: 'home'
  }))
}))

// Mock Pinia
vi.mock('pinia', () => ({
  createPinia: vi.fn(() => ({
    install: vi.fn()
  })),
  defineStore: vi.fn(),
  setActivePinia: vi.fn()
}))

// Global test setup
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
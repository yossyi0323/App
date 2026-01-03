<template>

  <div
    role="status"
    :class="cn('flex items-center gap-2 text-gray-500', className)"
  >
     <svg
      class="animate-spin h-5 w-5 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >

      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />

      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
       </svg
    > <span>{{ message }}</span
    >
  </div>

</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

withDefaults(defineProps<LoadingIndicatorProps>(), {
  message: '読み込み中...',
});
</script>


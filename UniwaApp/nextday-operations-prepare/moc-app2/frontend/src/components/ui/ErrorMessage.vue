<template>

  <div
    role="alert"
    :class="cn('text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2', className)"
  >
     {{ message }}
  </div>

</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

defineProps<ErrorMessageProps>();
</script>


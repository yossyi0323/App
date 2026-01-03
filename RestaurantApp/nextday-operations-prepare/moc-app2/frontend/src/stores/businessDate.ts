import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { format, parse } from 'date-fns';

export const useBusinessDateStore = defineStore('businessDate', () => {
  const businessDate = ref<string>(format(new Date(), 'yyyy-MM-dd'));

  const formattedBusinessDate = computed(() => businessDate.value);

  const setBusinessDate = (date: string | Date) => {
    if (typeof date === 'string') {
      businessDate.value = date;
    } else {
      businessDate.value = format(date, 'yyyy-MM-dd');
    }
  };

  return {
    businessDate,
    formattedBusinessDate,
    setBusinessDate,
  };
});

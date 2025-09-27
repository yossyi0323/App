import { defineStore } from 'pinia'
import { ref } from 'vue'
import { format } from 'date-fns'

export const useBusinessDateStore = defineStore('businessDate', () => {
  const businessDate = ref<string>(format(new Date(), 'yyyy-MM-dd'))

  const setBusinessDate = (date: string) => {
    businessDate.value = date
  }

  const getTodayDate = () => {
    return format(new Date(), 'yyyy-MM-dd')
  }

  return {
    businessDate,
    setBusinessDate,
    getTodayDate
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { placeApi } from '@/services/api'
import type { Place } from '@/types'

export const usePlaceStore = defineStore('place', () => {
  const places = ref<Place[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sourcePlaces = computed(() => 
    places.value.filter(place => place.type === '補充元')
  )

  const destinationPlaces = computed(() => 
    places.value.filter(place => place.type === '補充先')
  )

  const fetchPlaces = async () => {
    loading.value = true
    error.value = null
    try {
      places.value = await placeApi.getAll()
    } catch (err) {
      error.value = '場所データの取得に失敗しました'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchSourcePlaces = async () => {
    loading.value = true
    error.value = null
    try {
      const sourcePlacesData = await placeApi.getSource()
      places.value = places.value.filter(p => p.type !== '補充元')
      places.value.push(...sourcePlacesData)
    } catch (err) {
      error.value = '補充元データの取得に失敗しました'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchDestinationPlaces = async () => {
    loading.value = true
    error.value = null
    try {
      const destinationPlacesData = await placeApi.getDestination()
      places.value = places.value.filter(p => p.type !== '補充先')
      places.value.push(...destinationPlacesData)
    } catch (err) {
      error.value = '補充先データの取得に失敗しました'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const getPlaceById = (id: string) => {
    return places.value.find(place => place.id === id)
  }

  const getPlaceByName = (name: string) => {
    return places.value.find(place => place.name === name)
  }

  return {
    places,
    loading,
    error,
    sourcePlaces,
    destinationPlaces,
    fetchPlaces,
    fetchSourcePlaces,
    fetchDestinationPlaces,
    getPlaceById,
    getPlaceByName
  }
})

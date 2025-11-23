import { defineStore } from 'pinia';
import { ref } from 'vue';
import { placeApi } from '@/services/api';
import type { Place } from '@/types';

export const usePlaceStore = defineStore('place', () => {
  const places = ref<Place[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const sourcePlaces = ref<Place[]>([]);
  const destinationPlaces = ref<Place[]>([]);

  const fetchAll = async () => {
    loading.value = true;
    error.value = null;
    try {
      places.value = await placeApi.getAll();
    } catch (err) {
      error.value = '場所データの取得に失敗しました';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSourcePlaces = async () => {
    loading.value = true;
    error.value = null;
    try {
      sourcePlaces.value = await placeApi.getSource();
    } catch (err) {
      error.value = '補充元データの取得に失敗しました';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchDestinationPlaces = async () => {
    loading.value = true;
    error.value = null;
    try {
      destinationPlaces.value = await placeApi.getDestination();
    } catch (err) {
      error.value = '補充先データの取得に失敗しました';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    places,
    sourcePlaces,
    destinationPlaces,
    loading,
    error,
    fetchAll,
    fetchSourcePlaces,
    fetchDestinationPlaces,
  };
});

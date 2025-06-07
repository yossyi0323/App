'use client';

import { useEffect, useState } from 'react';
import type { InventoryStatus, Reservation, ReservationNote } from './types';

// Generic function to save an item to localStorage
function saveToStorage<T>(key: string, data: T): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(data));
  }
}

// Generic function to get an item from localStorage
function getFromStorage<T>(key: string): T | null {
  if (typeof window !== 'undefined') {
    const data = window.localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  }
  return null;
}

// Generic function to remove an item from localStorage
function removeFromStorage(key: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(key);
  }
}

// Inventory status hooks
export function useInventoryStatusStorage(date: string, itemId: string) {
  const storageKey = `inventory_status_${date}_${itemId}`;
  const [status, setStatus] = useState<InventoryStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedStatus = getFromStorage<InventoryStatus>(storageKey);
    if (storedStatus) {
      setStatus(storedStatus);
    }
    setIsLoading(false);
  }, [storageKey]);

  const updateStatus = (newStatus: Partial<InventoryStatus>) => {
    const updatedStatus = { ...status, ...newStatus } as InventoryStatus;
    setStatus(updatedStatus);
    saveToStorage(storageKey, updatedStatus);
  };

  return { status, updateStatus, isLoading };
}

// Batch save for inventory statuses
export function saveBatchInventoryStatuses(statuses: InventoryStatus[]): void {
  statuses.forEach(status => {
    const key = `inventory_status_${status.date}_${status.itemId}`;
    saveToStorage(key, status);
  });
}

// Reservation hooks
export function useReservationStorage(date: string) {
  const storageKey = `reservations_${date}`;
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedReservations = getFromStorage<Reservation[]>(storageKey);
    if (storedReservations) {
      setReservations(storedReservations);
    }
    setIsLoading(false);
  }, [storageKey]);

  const addReservation = (reservation: Reservation) => {
    const updatedReservations = [...reservations, reservation];
    setReservations(updatedReservations);
    saveToStorage(storageKey, updatedReservations);
  };

  const updateReservation = (index: number, reservation: Reservation) => {
    const updatedReservations = [...reservations];
    updatedReservations[index] = reservation;
    setReservations(updatedReservations);
    saveToStorage(storageKey, updatedReservations);
  };

  const removeReservation = (index: number) => {
    const updatedReservations = [...reservations];
    updatedReservations.splice(index, 1);
    setReservations(updatedReservations);
    saveToStorage(storageKey, updatedReservations);
  };

  return { 
    reservations, 
    addReservation, 
    updateReservation, 
    removeReservation, 
    isLoading 
  };
}

// Reservation note hooks
export function useReservationNoteStorage(date: string) {
  const storageKey = `reservation_note_${date}`;
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedNote = getFromStorage<ReservationNote>(storageKey);
    if (storedNote) {
      setNote(storedNote.note);
    }
    setIsLoading(false);
  }, [storageKey]);

  const updateNote = (newNote: string) => {
    setNote(newNote);
    saveToStorage(storageKey, { date, note: newNote });
  };

  return { note, updateNote, isLoading };
}

// Clear all local data
export function clearAllLocalData(): void {
  if (typeof window !== 'undefined') {
    // Only clear our app's data, not everything in localStorage
    const keys = Object.keys(localStorage);
    const ourKeys = keys.filter(key => 
      key.startsWith('inventory_status_') || 
      key.startsWith('reservations_') || 
      key.startsWith('reservation_note_')
    );
    
    ourKeys.forEach(key => {
      removeFromStorage(key);
    });
  }
}
'use client';

import { useState, useEffect, useRef } from 'react';

type AutoSaveOptions = {
  onSave: (value: any) => void;
  debounceTime?: number;
  longDebounceTime?: number;
  immediateOnBlur?: boolean;
};

export function useAutoSave<T>({
  onSave,
  debounceTime = 5000,
  longDebounceTime = 30000,
  immediateOnBlur = true,
}: AutoSaveOptions) {
  const [value, setValue] = useState<T | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  // Set up long debounce timer
  useEffect(() => {
    longDebounceTimerRef.current = setInterval(() => {
      if (isDirty && value !== null) {
        saveData();
      }
    }, longDebounceTime);

    return () => {
      if (longDebounceTimerRef.current) {
        clearInterval(longDebounceTimerRef.current);
      }
    };
  }, [isDirty, value, longDebounceTime]);

  const saveData = () => {
    if (value === null || !isDirty) return;
    
    setIsSaving(true);
    onSave(value);
    setIsDirty(false);
    lastSaveTimeRef.current = Date.now();
    setIsSaving(false);
  };

  const updateValue = (newValue: T) => {
    setValue(newValue);
    setIsDirty(true);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only set a new timer if we haven't saved recently
    if (Date.now() - lastSaveTimeRef.current > debounceTime) {
      debounceTimerRef.current = setTimeout(() => {
        saveData();
      }, debounceTime);
    }
  };

  const handleBlur = () => {
    if (immediateOnBlur && isDirty) {
      saveData();
    }
  };

  return {
    value,
    updateValue,
    isDirty,
    isSaving,
    handleBlur,
    saveNow: saveData
  };
}
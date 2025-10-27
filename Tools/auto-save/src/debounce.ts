/**
 * Simple debounce implementation
 * @param fn Function to debounce
 * @param delayMs Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delayMs);
  };
}

/**
 * Cancel pending debounced call
 */
export function cancelDebounce(debouncedFn: any): void {
  if (debouncedFn.timerId) {
    clearTimeout(debouncedFn.timerId);
    debouncedFn.timerId = null;
  }
}



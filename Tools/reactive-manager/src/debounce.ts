/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>): void {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

/**
 * Creates a cancellable debounced function
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns An object with the debounced function and a cancel method
 */
export function debounceCancellable<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): { 
  debounced: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: (...args: Parameters<T>) => void;
} {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };

  const cancel = (): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  const flush = (...args: Parameters<T>): void => {
    cancel();
    func(...args);
  };

  return { debounced, cancel, flush };
}


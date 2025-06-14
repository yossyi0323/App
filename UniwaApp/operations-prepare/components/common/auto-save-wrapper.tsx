import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AutoSaveManager } from '@/lib/utils/auto-save-utils';

// ジェネリクス型でpropsを受け取る
export type AutoSaveWrapperProps<T, R, S> = {
  autoSaveManager: AutoSaveManager<T, R, S> | null;
  children: ReactNode;
};

export function AutoSaveWrapper<T, R, S>({
  autoSaveManager,
  children,
}: AutoSaveWrapperProps<T, R, S>) {
  useEffect(() => {
    if (!autoSaveManager) return;

    const handleBeforeUnload = async () => {
      if (autoSaveManager.needsSave()) {
        await autoSaveManager.saveNow();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      handleBeforeUnload(); // アンマウント時も保存
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoSaveManager]);

  return <>{children}</>;
}

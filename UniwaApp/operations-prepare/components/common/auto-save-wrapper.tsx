import { useEffect } from 'react';
import type { AutoSaveManager } from '@/lib/utils/auto-save-utils';

interface AutoSaveWrapperProps {
  autoSaveManager: AutoSaveManager | null;
  children: React.ReactNode;
}

export function AutoSaveWrapper({ autoSaveManager, children }: AutoSaveWrapperProps) {
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
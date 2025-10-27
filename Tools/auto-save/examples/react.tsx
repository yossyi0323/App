/**
 * React example with hooks
 */

import { useState, useEffect, useRef } from 'react';
import { AutoSaveManager, SaveState } from '../src';

interface InventoryItem {
  id: string;
  name: string;
  inventoryCount: number;
  version: number;
}

export function useAutoSave() {
  const [saveState, setSaveState] = useState<SaveState>(SaveState.IDLE);
  const [saveMessage, setSaveMessage] = useState('');
  
  const autoSaveRef = useRef<AutoSaveManager<InventoryItem>>();
  
  useEffect(() => {
    // Create auto-save manager
    autoSaveRef.current = new AutoSaveManager<InventoryItem>({
      debounceMs: 3000,
      
      saveFunction: async (data) => {
        const response = await fetch(`/api/inventory-status/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.status === 409) {
          throw new Error('Conflict');
        }
        
        if (!response.ok) {
          throw new Error('Save failed');
        }
        
        return await response.json();
      },
      
      callbacks: {
        onSaving: () => {
          setSaveState(SaveState.SAVING);
          setSaveMessage('保存中...');
        },
        onSaved: () => {
          setSaveState(SaveState.SAVED);
          setSaveMessage('保存しました');
          setTimeout(() => setSaveMessage(''), 2000);
        },
        onError: (error) => {
          setSaveState(SaveState.ERROR);
          setSaveMessage('保存エラー');
          console.error(error);
        },
        onConflict: () => {
          setSaveState(SaveState.CONFLICT);
          alert('他のユーザーが更新しました。ページをリロードしてください。');
        }
      }
    });
    
    // Cleanup
    return () => {
      if (autoSaveRef.current?.hasUnsavedChanges()) {
        autoSaveRef.current.forceSave();
      }
    };
  }, []);
  
  return {
    autoSave: autoSaveRef.current!,
    saveState,
    saveMessage
  };
}

// Usage in React component:
/*
function InventoryItemCard({ item }: { item: InventoryItem }) {
  const { autoSave, saveMessage } = useAutoSave();
  const [count, setCount] = useState(item.inventoryCount);
  
  const handleCountChange = (newCount: number) => {
    setCount(newCount);
    autoSave.update(item.id, {
      ...item,
      inventoryCount: newCount
    });
  };
  
  return (
    <div>
      <input 
        type="number" 
        value={count}
        onChange={(e) => handleCountChange(Number(e.target.value))}
      />
      <span>{saveMessage}</span>
    </div>
  );
}
*/



import { debounce } from './debounce';
import { DirtyTracker } from './dirty-tracker';
import {
  AutoSaveConfig,
  Versionable,
  SaveState,
  ConflictError,
  AutoSaveCallbacks
} from './types';

/**
 * Google Sheets-like auto-save manager
 * 
 * Features:
 * - Debounced auto-save (default: 3 seconds)
 * - Dirty tracking (only save changed items)
 * - Optimistic locking support (version management)
 * - Save state management
 * - Framework agnostic (works with React, Vue, Vanilla JS)
 */
export class AutoSaveManager<T extends Versionable> {
  private debounceMs: number;
  private saveFunction: (data: T) => Promise<T>;
  private callbacks: AutoSaveCallbacks;
  
  private dirtyTracker: DirtyTracker<T>;
  private saveState: SaveState = SaveState.IDLE;
  private isSaving = false;
  
  private debouncedSave: () => void;

  constructor(config: AutoSaveConfig<T>) {
    this.debounceMs = config.debounceMs ?? 3000;
    this.saveFunction = config.saveFunction;
    this.callbacks = config.callbacks ?? {};
    
    this.dirtyTracker = new DirtyTracker<T>();
    this.debouncedSave = debounce(() => this.executeSave(), this.debounceMs);
  }

  /**
   * Mark item as dirty and schedule auto-save
   * Call this whenever user modifies data
   */
  update(id: string, data: T): void {
    this.dirtyTracker.markDirty(id, data);
    this.debouncedSave();
  }

  /**
   * Execute save for all dirty items
   */
  private async executeSave(): Promise<void> {
    if (this.isSaving) {
      return; // Prevent concurrent saves
    }

    if (!this.dirtyTracker.hasDirtyItems()) {
      return; // Nothing to save
    }

    this.isSaving = true;
    this.saveState = SaveState.SAVING;
    this.callbacks.onSaving?.();

    try {
      const dirtyItems = this.dirtyTracker.getDirtyItems();
      
      // Save all dirty items
      for (const [id, data] of dirtyItems) {
        const saved = await this.saveFunction(data);
        this.dirtyTracker.markSaved(id, saved);
      }

      this.saveState = SaveState.SAVED;
      this.callbacks.onSaved?.();
    } catch (error) {
      // Check if it's a conflict error
      if (this.isConflictError(error)) {
        this.saveState = SaveState.CONFLICT;
        this.callbacks.onConflict?.();
      } else {
        this.saveState = SaveState.ERROR;
        this.callbacks.onError?.(error as Error);
      }
      throw error;
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Check if error is a conflict error (409)
   */
  private isConflictError(error: any): boolean {
    if (error instanceof ConflictError) {
      return true;
    }
    if (error?.status === 409) {
      return true;
    }
    if (error?.response?.status === 409) {
      return true;
    }
    return false;
  }

  /**
   * Force save immediately (bypass debounce)
   */
  async forceSave(): Promise<void> {
    await this.executeSave();
  }

  /**
   * Get current save state
   */
  getSaveState(): SaveState {
    return this.saveState;
  }

  /**
   * Check if currently saving
   */
  isSavingNow(): boolean {
    return this.isSaving;
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges(): boolean {
    return this.dirtyTracker.hasDirtyItems();
  }

  /**
   * Get count of unsaved items
   */
  getUnsavedCount(): number {
    return this.dirtyTracker.getDirtyCount();
  }
}


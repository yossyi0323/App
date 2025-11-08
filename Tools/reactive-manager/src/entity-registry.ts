import { 
  Versionable, 
  EntityConfig, 
  EntityRegistryEntry, 
  SaveState,
  DEFAULT_DEBOUNCE_MS 
} from './types';
import { DirtyTracker } from './dirty-tracker';
import { createRestOperations } from './rest-adapter';

/**
 * Entity registry for managing registered entities
 */
export class EntityRegistry {
  private entities = new Map<string, EntityRegistryEntry>();

  /**
   * Register an entity with its configuration
   */
  register<T extends Versionable>(entityKey: string, config: EntityConfig<T>): void {
    // Create operations map
    const operations = new Map<string, (...args: any[]) => Promise<any>>();

    // If baseUrl is provided, generate REST operations
    if (config.baseUrl) {
      const restOps = createRestOperations<T>(config.baseUrl);
      operations.set('get', restOps.get);
      operations.set('post', restOps.post);
      operations.set('put', restOps.put);
      operations.set('save', restOps.save);
      operations.set('delete', restOps.delete);
    }

    // Add manual operations (override REST operations if provided)
    const standardKeys = [
      'baseUrl', 'debounceMs', 
      'validateBeforeSave', 'onBeforeSave', 'onAfterSave',
      'onStateChange', 'onSaved', 'onError', 'onConflict'
    ];

    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'function' && !standardKeys.includes(key)) {
        operations.set(key, value as (...args: any[]) => Promise<any>);
      }
    }

    // Create registry entry
    const entry: EntityRegistryEntry<T> = {
      config,
      debounceMs: config.debounceMs ?? DEFAULT_DEBOUNCE_MS,
      operations,
      dirtyItems: new Map(),
      saveTimers: new Map(),
      saveStates: new Map(),
    };

    this.entities.set(entityKey, entry);
  }

  /**
   * Unregister an entity
   */
  unregister(entityKey: string): void {
    const entry = this.entities.get(entityKey);
    if (entry) {
      // Clear all timers
      entry.saveTimers.forEach(timer => clearTimeout(timer));
      entry.saveTimers.clear();
      this.entities.delete(entityKey);
    }
  }

  /**
   * Get entity entry
   */
  get(entityKey: string): EntityRegistryEntry | undefined {
    return this.entities.get(entityKey);
  }

  /**
   * Check if entity is registered
   */
  has(entityKey: string): boolean {
    return this.entities.has(entityKey);
  }

  /**
   * Get operation from entity
   */
  getOperation(entityKey: string, operationName: string): ((...args: any[]) => Promise<any>) | undefined {
    const entry = this.entities.get(entityKey);
    return entry?.operations.get(operationName);
  }

  /**
   * Check if operation exists
   */
  hasOperation(entityKey: string, operationName: string): boolean {
    const entry = this.entities.get(entityKey);
    return entry?.operations.has(operationName) ?? false;
  }

  /**
   * Get all registered entity keys
   */
  getEntityKeys(): string[] {
    return Array.from(this.entities.keys());
  }

  /**
   * Mark item as dirty
   */
  markDirty<T extends Versionable>(entityKey: string, id: string, data: T): void {
    const entry = this.entities.get(entityKey);
    if (entry) {
      entry.dirtyItems.set(id, data);
    }
  }

  /**
   * Mark item as saved
   */
  markSaved(entityKey: string, id: string): void {
    const entry = this.entities.get(entityKey);
    if (entry) {
      entry.dirtyItems.delete(id);
    }
  }

  /**
   * Get dirty item
   */
  getDirtyItem(entityKey: string, id: string): Versionable | undefined {
    const entry = this.entities.get(entityKey);
    return entry?.dirtyItems.get(id);
  }

  /**
   * Check if item is dirty
   */
  isDirty(entityKey: string, id: string): boolean {
    const entry = this.entities.get(entityKey);
    return entry?.dirtyItems.has(id) ?? false;
  }

  /**
   * Get save state
   */
  getSaveState(entityKey: string, id: string): SaveState {
    const entry = this.entities.get(entityKey);
    return entry?.saveStates.get(id) ?? SaveState.IDLE;
  }

  /**
   * Set save state
   */
  setSaveState(entityKey: string, id: string, state: SaveState, data?: Versionable): void {
    const entry = this.entities.get(entityKey);
    if (entry) {
      entry.saveStates.set(id, state);
      
      // Trigger onStateChange callback
      if (entry.config.onStateChange) {
        const callbackData = data ?? entry.dirtyItems.get(id);
        entry.config.onStateChange(state, callbackData);
      }
    }
  }

  /**
   * Get save timer
   */
  getSaveTimer(entityKey: string, id: string): NodeJS.Timeout | undefined {
    const entry = this.entities.get(entityKey);
    return entry?.saveTimers.get(id);
  }

  /**
   * Set save timer
   */
  setSaveTimer(entityKey: string, id: string, timer: NodeJS.Timeout): void {
    const entry = this.entities.get(entityKey);
    if (entry) {
      // Clear existing timer
      const existingTimer = entry.saveTimers.get(id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      entry.saveTimers.set(id, timer);
    }
  }

  /**
   * Clear save timer
   */
  clearSaveTimer(entityKey: string, id: string): void {
    const entry = this.entities.get(entityKey);
    if (entry) {
      const timer = entry.saveTimers.get(id);
      if (timer) {
        clearTimeout(timer);
        entry.saveTimers.delete(id);
      }
    }
  }

  /**
   * Check if any entity is saving
   */
  isAnySaving(): boolean {
    for (const entry of this.entities.values()) {
      for (const state of entry.saveStates.values()) {
        if (state === SaveState.SAVING) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if any entity has unsaved changes
   */
  hasAnyUnsavedChanges(): boolean {
    for (const entry of this.entities.values()) {
      if (entry.dirtyItems.size > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get total unsaved count
   */
  getUnsavedCount(): number {
    let count = 0;
    for (const entry of this.entities.values()) {
      count += entry.dirtyItems.size;
    }
    return count;
  }
}


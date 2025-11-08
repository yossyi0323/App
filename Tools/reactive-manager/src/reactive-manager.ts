import { 
  Versionable, 
  ReactiveManagerConfig, 
  EntityConfig, 
  OperationOptions,
  SaveState,
  ConflictError,
  DEFAULT_DEBOUNCE_MS
} from './types';
import { EntityRegistry } from './entity-registry';
import { isConflictError } from './rest-adapter';

/**
 * Reactive Manager for auto-save and data synchronization
 */
export class ReactiveManager {
  private registry: EntityRegistry;
  private config: ReactiveManagerConfig;

  constructor(config: ReactiveManagerConfig = {}) {
    this.registry = new EntityRegistry();
    this.config = {
      defaultDebounceMs: config.defaultDebounceMs ?? DEFAULT_DEBOUNCE_MS,
      onError: config.onError,
    };
  }

  /**
   * Register an entity with its configuration
   */
  register<T extends Versionable>(entityKey: string, config: EntityConfig<T>): void {
    // Apply default debounce if not specified
    const finalConfig = {
      ...config,
      debounceMs: config.debounceMs ?? this.config.defaultDebounceMs,
    };

    this.registry.register(entityKey, finalConfig);
  }

  /**
   * Unregister an entity
   */
  unregister(entityKey: string): void {
    this.registry.unregister(entityKey);
  }

  /**
   * GET operation
   */
  async get<T extends Versionable>(entityKey: string, id?: string): Promise<T | T[]> {
    this.ensureEntityRegistered(entityKey);
    const operation = this.registry.getOperation(entityKey, 'get');
    
    if (!operation) {
      throw new Error(`GET operation not configured for entity: ${entityKey}`);
    }

    try {
      return await operation(id);
    } catch (error) {
      this.handleError(entityKey, error as Error);
      throw error;
    }
  }

  /**
   * POST operation (create)
   */
  async post<T extends Versionable>(
    entityKey: string, 
    data: T, 
    options: OperationOptions = {}
  ): Promise<T> {
    this.ensureEntityRegistered(entityKey);
    const operation = this.registry.getOperation(entityKey, 'post');
    
    if (!operation) {
      throw new Error(`POST operation not configured for entity: ${entityKey}`);
    }

    try {
      const entry = this.registry.get(entityKey)!;
      
      // Validate before save
      if (entry.config.validateBeforeSave) {
        const validationResult = entry.config.validateBeforeSave(data);
        if (validationResult !== true) {
          throw new Error(typeof validationResult === 'string' ? validationResult : 'Validation failed');
        }
      }

      // Transform data before save
      let transformedData = data;
      if (entry.config.onBeforeSave) {
        transformedData = entry.config.onBeforeSave(data);
      }

      const result = await operation(transformedData);

      // After save callback
      if (entry.config.onAfterSave) {
        entry.config.onAfterSave(result);
      }

      if (entry.config.onSaved) {
        entry.config.onSaved(result);
      }

      return result;
    } catch (error) {
      this.handleError(entityKey, error as Error);
      throw error;
    }
  }

  /**
   * PUT operation (update with debounce)
   */
  async put<T extends Versionable>(
    entityKey: string, 
    data: T, 
    options: OperationOptions = {}
  ): Promise<T> {
    this.ensureEntityRegistered(entityKey);
    
    if (!data.id) {
      throw new Error('ID is required for PUT operation');
    }

    if (options.immediate) {
      return this.executePut(entityKey, data);
    } else {
      return this.schedulePut(entityKey, data);
    }
  }

  /**
   * SAVE operation (auto-detect POST or PUT)
   */
  async save<T extends Versionable>(
    entityKey: string, 
    data: T, 
    options: OperationOptions = {}
  ): Promise<T> {
    this.ensureEntityRegistered(entityKey);
    const operation = this.registry.getOperation(entityKey, 'save');
    
    if (!operation) {
      // Fallback to auto-detect POST or PUT
      if (!data.id) {
        return this.post(entityKey, data, options);
      } else {
        return this.put(entityKey, data, options);
      }
    }

    // Use custom save operation
    if (options.immediate) {
      return this.executeSave(entityKey, data);
    } else {
      return this.scheduleSave(entityKey, data);
    }
  }

  /**
   * DELETE operation
   */
  async delete(
    entityKey: string, 
    idOrData: string | Versionable, 
    options: OperationOptions = {}
  ): Promise<void> {
    this.ensureEntityRegistered(entityKey);
    const operation = this.registry.getOperation(entityKey, 'delete');
    
    if (!operation) {
      throw new Error(`DELETE operation not configured for entity: ${entityKey}`);
    }

    const id = typeof idOrData === 'string' ? idOrData : idOrData.id;
    if (!id) {
      throw new Error('ID is required for DELETE operation');
    }

    if (options.immediate) {
      return this.executeDelete(entityKey, id);
    } else {
      return this.scheduleDelete(entityKey, id);
    }
  }

  /**
   * Call custom operation
   */
  async call<T = any>(entityKey: string, operationName: string, ...args: any[]): Promise<T> {
    this.ensureEntityRegistered(entityKey);
    const operation = this.registry.getOperation(entityKey, operationName);
    
    if (!operation) {
      throw new Error(`Operation '${operationName}' not configured for entity: ${entityKey}`);
    }

    try {
      return await operation(...args);
    } catch (error) {
      this.handleError(entityKey, error as Error);
      throw error;
    }
  }

  /**
   * Get save state
   */
  getSaveState(entityKey: string, id: string): SaveState {
    return this.registry.getSaveState(entityKey, id);
  }

  /**
   * Check if currently saving
   */
  isSaving(): boolean {
    return this.registry.isAnySaving();
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges(): boolean {
    return this.registry.hasAnyUnsavedChanges();
  }

  /**
   * Get count of unsaved items
   */
  getUnsavedCount(): number {
    return this.registry.getUnsavedCount();
  }

  /**
   * Force save all pending changes immediately
   */
  async forceSaveAll(): Promise<void> {
    const entityKeys = this.registry.getEntityKeys();
    const promises: Promise<any>[] = [];

    for (const entityKey of entityKeys) {
      const entry = this.registry.get(entityKey);
      if (entry) {
        for (const [id, data] of entry.dirtyItems) {
          promises.push(this.executePut(entityKey, data as Versionable));
        }
      }
    }

    await Promise.all(promises);
  }

  // Private helper methods

  private ensureEntityRegistered(entityKey: string): void {
    if (!this.registry.has(entityKey)) {
      throw new Error(`Entity not registered: ${entityKey}`);
    }
  }

  private schedulePut<T extends Versionable>(entityKey: string, data: T): Promise<T> {
    if (!data.id) {
      throw new Error('ID is required for PUT operation');
    }

    const id = data.id; // Type guard
    const entry = this.registry.get(entityKey)!;
    
    // Mark as dirty
    this.registry.markDirty(entityKey, id, data);

    // Clear existing timer
    this.registry.clearSaveTimer(entityKey, id);

    // Create promise that resolves when save completes
    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          const result = await this.executePut(entityKey, data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, entry.debounceMs);

      this.registry.setSaveTimer(entityKey, id, timer);
    });
  }

  private async executePut<T extends Versionable>(entityKey: string, data: T): Promise<T> {
    if (!data.id) {
      throw new Error('ID is required for PUT operation');
    }

    const entry = this.registry.get(entityKey)!;
    const operation = this.registry.getOperation(entityKey, 'put');
    
    if (!operation) {
      throw new Error(`PUT operation not configured for entity: ${entityKey}`);
    }

    try {
      // Validate
      if (entry.config.validateBeforeSave) {
        const validationResult = entry.config.validateBeforeSave(data);
        if (validationResult !== true) {
          throw new Error(typeof validationResult === 'string' ? validationResult : 'Validation failed');
        }
      }

      // Set saving state
      this.registry.setSaveState(entityKey, data.id, SaveState.SAVING, data);

      // Transform data
      let transformedData = data;
      if (entry.config.onBeforeSave) {
        transformedData = entry.config.onBeforeSave(data);
      }

      // Execute save
      const result = await operation(transformedData);

      // Mark as saved
      this.registry.markSaved(entityKey, data.id);
      this.registry.setSaveState(entityKey, data.id, SaveState.SAVED, result);

      // Callbacks
      if (entry.config.onAfterSave) {
        entry.config.onAfterSave(result);
      }

      if (entry.config.onSaved) {
        entry.config.onSaved(result);
      }

      return result;
    } catch (error) {
      if (isConflictError(error)) {
        this.registry.setSaveState(entityKey, data.id, SaveState.CONFLICT, data);
        if (entry.config.onConflict) {
          entry.config.onConflict(data);
        }
      } else {
        this.registry.setSaveState(entityKey, data.id, SaveState.ERROR, data);
      }
      
      this.handleError(entityKey, error as Error);
      throw error;
    }
  }

  private scheduleSave<T extends Versionable>(entityKey: string, data: T): Promise<T> {
    const id = data.id ?? 'new';
    const entry = this.registry.get(entityKey)!;
    
    // Mark as dirty
    this.registry.markDirty(entityKey, id, data);

    // Clear existing timer
    this.registry.clearSaveTimer(entityKey, id);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          const result = await this.executeSave(entityKey, data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, entry.debounceMs);

      this.registry.setSaveTimer(entityKey, id, timer);
    });
  }

  private async executeSave<T extends Versionable>(entityKey: string, data: T): Promise<T> {
    const operation = this.registry.getOperation(entityKey, 'save');
    const entry = this.registry.get(entityKey)!;
    
    if (!operation) {
      // Fallback to auto-detect
      if (!data.id) {
        return this.post(entityKey, data, { immediate: true });
      } else {
        return this.executePut(entityKey, data);
      }
    }

    const id = data.id ?? 'new';

    try {
      // Validate
      if (entry.config.validateBeforeSave) {
        const validationResult = entry.config.validateBeforeSave(data);
        if (validationResult !== true) {
          throw new Error(typeof validationResult === 'string' ? validationResult : 'Validation failed');
        }
      }

      // Set saving state
      this.registry.setSaveState(entityKey, id, SaveState.SAVING, data);

      // Transform data
      let transformedData = data;
      if (entry.config.onBeforeSave) {
        transformedData = entry.config.onBeforeSave(data);
      }

      // Execute save
      const result = await operation(transformedData);

      // Mark as saved
      this.registry.markSaved(entityKey, id);
      this.registry.setSaveState(entityKey, id, SaveState.SAVED, result);

      // Callbacks
      if (entry.config.onAfterSave) {
        entry.config.onAfterSave(result);
      }

      if (entry.config.onSaved) {
        entry.config.onSaved(result);
      }

      return result;
    } catch (error) {
      if (isConflictError(error)) {
        this.registry.setSaveState(entityKey, id, SaveState.CONFLICT, data);
        if (entry.config.onConflict) {
          entry.config.onConflict(data);
        }
      } else {
        this.registry.setSaveState(entityKey, id, SaveState.ERROR, data);
      }
      
      this.handleError(entityKey, error as Error);
      throw error;
    }
  }

  private scheduleDelete(entityKey: string, id: string): Promise<void> {
    const entry = this.registry.get(entityKey)!;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          await this.executeDelete(entityKey, id);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, entry.debounceMs);

      this.registry.setSaveTimer(entityKey, id, timer);
    });
  }

  private async executeDelete(entityKey: string, id: string): Promise<void> {
    const operation = this.registry.getOperation(entityKey, 'delete');
    
    if (!operation) {
      throw new Error(`DELETE operation not configured for entity: ${entityKey}`);
    }

    try {
      await operation(id);
      
      // Clean up
      this.registry.markSaved(entityKey, id);
      this.registry.clearSaveTimer(entityKey, id);
    } catch (error) {
      this.handleError(entityKey, error as Error);
      throw error;
    }
  }

  private handleError(entityKey: string, error: Error): void {
    const entry = this.registry.get(entityKey);
    
    // Entity-specific error handler
    if (entry?.config.onError) {
      entry.config.onError(error);
    }
    
    // Global error handler
    if (this.config.onError) {
      this.config.onError(error);
    }
  }
}

/**
 * Create a new ReactiveManager instance
 */
export function createReactiveManager(config?: ReactiveManagerConfig): ReactiveManager {
  return new ReactiveManager(config);
}


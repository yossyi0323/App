/**
 * Versionable data interface for optimistic locking
 */
export interface Versionable {
  id?: string | null;
  version: number;
  [key: string]: any;
}

/**
 * Save state enumeration
 */
export enum SaveState {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  CONFLICT = 'conflict'
}

/**
 * Operation options
 */
export interface OperationOptions {
  immediate?: boolean;
}

/**
 * Conflict error for optimistic locking failures
 */
export class ConflictError extends Error {
  constructor(message: string = 'Data was modified by another user') {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * Entity configuration for registration
 */
export interface EntityConfig<T extends Versionable = any> {
  // REST API auto-configuration
  baseUrl?: string;
  
  // Standard CRUD operations (manual configuration)
  get?: (id?: string) => Promise<T | T[]>;
  post?: (data: T) => Promise<T>;
  put?: (data: T) => Promise<T>;
  save?: (data: T) => Promise<T>;
  delete?: (id: string) => Promise<void>;
  
  // Custom operations (any additional operations)
  [key: string]: any;
  
  // Configuration
  debounceMs?: number;
  
  // Lifecycle hooks
  validateBeforeSave?: (data: T) => boolean | string;
  onBeforeSave?: (data: T) => T;
  onAfterSave?: (data: T) => void;
  onStateChange?: (state: SaveState, data?: T) => void;
  onSaved?: (data: T) => void;
  onError?: (error: Error) => void;
  onConflict?: (data: T) => void;
}

/**
 * Reactive manager configuration
 */
export interface ReactiveManagerConfig {
  defaultDebounceMs?: number;
  onError?: (error: Error) => void;
}

/**
 * Internal entity registry entry
 */
export interface EntityRegistryEntry<T extends Versionable = any> {
  config: EntityConfig<T>;
  debounceMs: number;
  operations: Map<string, (...args: any[]) => Promise<any>>;
  dirtyItems: Map<string, T>;
  saveTimers: Map<string, NodeJS.Timeout>;
  saveStates: Map<string, SaveState>;
}

/**
 * Default debounce time in milliseconds
 */
export const DEFAULT_DEBOUNCE_MS = 1000;


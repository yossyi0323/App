/**
 * Data with version for optimistic locking
 */
export interface Versionable {
  version: number;
  [key: string]: any;
}

/**
 * Save function type
 */
export type SaveFunction<T extends Versionable> = (data: T) => Promise<T>;

/**
 * Callback functions
 */
export interface AutoSaveCallbacks {
  onSaving?: () => void;
  onSaved?: () => void;
  onError?: (error: Error) => void;
  onConflict?: () => void;
}

/**
 * AutoSaveManager configuration
 */
export interface AutoSaveConfig<T extends Versionable> {
  debounceMs?: number;
  saveFunction: SaveFunction<T>;
  callbacks?: AutoSaveCallbacks;
}

/**
 * Save state
 */
export enum SaveState {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  CONFLICT = 'conflict'
}

/**
 * Conflict error thrown when optimistic lock fails
 */
export class ConflictError extends Error {
  constructor(message: string = 'Data was modified by another user') {
    super(message);
    this.name = 'ConflictError';
  }
}



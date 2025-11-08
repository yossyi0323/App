// Main exports
export { ReactiveManager, createReactiveManager } from './reactive-manager';

// Type exports
export type {
  Versionable,
  OperationOptions,
  EntityConfig,
  ReactiveManagerConfig,
} from './types';

export {
  SaveState,
  ConflictError,
  DEFAULT_DEBOUNCE_MS
} from './types';

// Utility exports (for advanced usage)
export { EntityRegistry } from './entity-registry';
export { DirtyTracker } from './dirty-tracker';
export { debounce, debounceCancellable } from './debounce';
export { createRestOperations, isConflictError } from './rest-adapter';


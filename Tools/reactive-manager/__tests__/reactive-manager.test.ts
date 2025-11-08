import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReactiveManager, SaveState } from '../src';

describe('ReactiveManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Entity Registration', () => {
    it('should register an entity with baseUrl', () => {
      const manager = createReactiveManager();
      
      expect(() => {
        manager.register('item', {
          baseUrl: '/api/items'
        });
      }).not.toThrow();
    });

    it('should register an entity with manual operations', () => {
      const manager = createReactiveManager();
      const mockSave = vi.fn().mockResolvedValue({ id: '1', version: 1 });
      
      manager.register('item', {
        save: mockSave
      });

      expect(() => manager.save('item', { id: '1', version: 1 })).not.toThrow();
    });

    it('should register custom operations', () => {
      const manager = createReactiveManager();
      const mockCheck = vi.fn().mockResolvedValue(true);
      
      manager.register('item', {
        baseUrl: '/api/items',
        check: mockCheck
      });

      expect(() => manager.call('item', 'check', { id: '1' })).not.toThrow();
    });

    it('should unregister an entity', () => {
      const manager = createReactiveManager();
      
      manager.register('item', {
        baseUrl: '/api/items'
      });

      manager.unregister('item');

      expect(() => manager.get('item')).rejects.toThrow('Entity not registered');
    });
  });

  describe('CRUD Operations', () => {
    it('should throw error for unregistered entity', async () => {
      const manager = createReactiveManager();

      await expect(manager.get('item')).rejects.toThrow('Entity not registered');
    });

    it('should execute save with debounce', async () => {
      const manager = createReactiveManager({
        defaultDebounceMs: 100
      });

      const mockSave = vi.fn().mockResolvedValue({ id: '1', name: 'test', version: 2 });
      
      manager.register('item', {
        save: mockSave
      });

      const promise = manager.save('item', { id: '1', name: 'test', version: 1 });

      // Should not be called immediately
      expect(mockSave).not.toHaveBeenCalled();

      await promise;

      // Should be called after debounce
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should execute save immediately with immediate option', async () => {
      const manager = createReactiveManager();

      const mockSave = vi.fn().mockResolvedValue({ id: '1', name: 'test', version: 2 });
      
      manager.register('item', {
        save: mockSave
      });

      await manager.save('item', { id: '1', name: 'test', version: 1 }, { immediate: true });

      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should call validateBeforeSave', async () => {
      const manager = createReactiveManager();

      const mockValidate = vi.fn().mockReturnValue(true);
      const mockSave = vi.fn().mockResolvedValue({ id: '1', name: 'test', version: 2 });
      
      manager.register('item', {
        save: mockSave,
        validateBeforeSave: mockValidate
      });

      await manager.save('item', { id: '1', name: 'test', version: 1 }, { immediate: true });

      expect(mockValidate).toHaveBeenCalledWith({ id: '1', name: 'test', version: 1 });
    });

    it('should reject save if validation fails', async () => {
      const manager = createReactiveManager();

      const mockValidate = vi.fn().mockReturnValue('Name is required');
      const mockSave = vi.fn().mockResolvedValue({ id: '1', name: 'test', version: 2 });
      
      manager.register('item', {
        save: mockSave,
        validateBeforeSave: mockValidate
      });

      await expect(
        manager.save('item', { id: '1', name: '', version: 1 }, { immediate: true })
      ).rejects.toThrow('Name is required');

      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should return IDLE state initially', () => {
      const manager = createReactiveManager();
      
      manager.register('item', {
        baseUrl: '/api/items'
      });

      expect(manager.getSaveState('item', '1')).toBe(SaveState.IDLE);
    });

    it('should track saving state', async () => {
      const manager = createReactiveManager();

      let capturedState: SaveState | undefined;
      const mockSave = vi.fn().mockImplementation(async (data) => {
        capturedState = manager.getSaveState('item', '1');
        return { ...data, version: data.version + 1 };
      });
      
      manager.register('item', {
        save: mockSave
      });

      await manager.save('item', { id: '1', name: 'test', version: 1 }, { immediate: true });

      expect(capturedState).toBe(SaveState.SAVING);
      expect(manager.getSaveState('item', '1')).toBe(SaveState.SAVED);
    });

    it('should check if saving', async () => {
      const manager = createReactiveManager({ defaultDebounceMs: 100 });

      const mockSave = vi.fn().mockImplementation(async (data) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return { ...data, version: data.version + 1 };
      });
      
      manager.register('item', {
        save: mockSave
      });

      const promise = manager.save('item', { id: '1', name: 'test', version: 1 });

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(manager.isSaving()).toBe(true);

      await promise;

      expect(manager.isSaving()).toBe(false);
    });

    it('should check if has unsaved changes', () => {
      const manager = createReactiveManager({ defaultDebounceMs: 100 });

      const mockSave = vi.fn().mockResolvedValue({ id: '1', name: 'test', version: 2 });
      
      manager.register('item', {
        save: mockSave
      });

      manager.save('item', { id: '1', name: 'test', version: 1 });

      expect(manager.hasUnsavedChanges()).toBe(true);
      expect(manager.getUnsavedCount()).toBe(1);
    });
  });

  describe('Callbacks', () => {
    it('should call onStateChange callback', async () => {
      const manager = createReactiveManager();

      const mockOnStateChange = vi.fn();
      const mockSave = vi.fn().mockResolvedValue({ id: '1', name: 'test', version: 2 });
      
      manager.register('item', {
        save: mockSave,
        onStateChange: mockOnStateChange
      });

      await manager.save('item', { id: '1', name: 'test', version: 1 }, { immediate: true });

      expect(mockOnStateChange).toHaveBeenCalledWith(SaveState.SAVING, expect.any(Object));
      expect(mockOnStateChange).toHaveBeenCalledWith(SaveState.SAVED, expect.any(Object));
    });

    it('should call onSaved callback', async () => {
      const manager = createReactiveManager();

      const mockOnSaved = vi.fn();
      const mockSave = vi.fn().mockResolvedValue({ id: '1', name: 'test', version: 2 });
      
      manager.register('item', {
        save: mockSave,
        onSaved: mockOnSaved
      });

      await manager.save('item', { id: '1', name: 'test', version: 1 }, { immediate: true });

      expect(mockOnSaved).toHaveBeenCalledWith({ id: '1', name: 'test', version: 2 });
    });

    it('should call onError callback', async () => {
      const manager = createReactiveManager();

      const mockOnError = vi.fn();
      const mockSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      
      manager.register('item', {
        save: mockSave,
        onError: mockOnError
      });

      await expect(
        manager.save('item', { id: '1', name: 'test', version: 1 }, { immediate: true })
      ).rejects.toThrow('Save failed');

      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Custom Operations', () => {
    it('should execute custom operation', async () => {
      const manager = createReactiveManager();

      const mockCheck = vi.fn().mockResolvedValue({ valid: true });
      
      manager.register('item', {
        baseUrl: '/api/items',
        check: mockCheck
      });

      const result = await manager.call('item', 'check', { id: '1' });

      expect(mockCheck).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual({ valid: true });
    });

    it('should throw error for non-existent operation', async () => {
      const manager = createReactiveManager();

      manager.register('item', {
        baseUrl: '/api/items'
      });

      await expect(
        manager.call('item', 'nonExistent', { id: '1' })
      ).rejects.toThrow("Operation 'nonExistent' not configured");
    });
  });
});


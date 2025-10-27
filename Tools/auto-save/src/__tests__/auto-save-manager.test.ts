import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoSaveManager } from '../auto-save-manager';
import { SaveState, ConflictError } from '../types';

interface TestData {
  id: string;
  value: number;
  version: number;
}

describe('AutoSaveManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should auto-save after debounce delay', async () => {
    const saveFn = vi.fn().mockResolvedValue({ id: '1', value: 10, version: 2 });
    const onSaving = vi.fn();
    const onSaved = vi.fn();

    const manager = new AutoSaveManager<TestData>({
      debounceMs: 3000,
      saveFunction: saveFn,
      callbacks: { onSaving, onSaved }
    });

    manager.update('1', { id: '1', value: 10, version: 1 });

    // Should not save immediately
    expect(saveFn).not.toHaveBeenCalled();

    // Advance time
    vi.advanceTimersByTime(3000);
    await vi.runAllTimersAsync();

    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(onSaving).toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalled();
  });

  it('should reset debounce timer on subsequent updates', async () => {
    const saveFn = vi.fn().mockResolvedValue({ id: '1', value: 15, version: 2 });

    const manager = new AutoSaveManager<TestData>({
      debounceMs: 3000,
      saveFunction: saveFn
    });

    manager.update('1', { id: '1', value: 10, version: 1 });
    vi.advanceTimersByTime(1500);

    manager.update('1', { id: '1', value: 15, version: 1 }); // Reset timer
    vi.advanceTimersByTime(2000);

    expect(saveFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    await vi.runAllTimersAsync();

    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(saveFn).toHaveBeenCalledWith({ id: '1', value: 15, version: 1 });
  });

  it('should not save if no dirty items', async () => {
    const saveFn = vi.fn();

    const manager = new AutoSaveManager<TestData>({
      debounceMs: 3000,
      saveFunction: saveFn
    });

    vi.advanceTimersByTime(3000);
    await vi.runAllTimersAsync();

    expect(saveFn).not.toHaveBeenCalled();
  });

  it('should handle conflict error (409)', async () => {
    const saveFn = vi.fn().mockRejectedValue({ status: 409 });
    const onConflict = vi.fn();

    const manager = new AutoSaveManager<TestData>({
      debounceMs: 3000,
      saveFunction: saveFn,
      callbacks: { onConflict }
    });

    manager.update('1', { id: '1', value: 10, version: 1 });

    vi.advanceTimersByTime(3000);
    
    try {
      await vi.runAllTimersAsync();
    } catch (error) {
      // Expected to throw
    }

    expect(onConflict).toHaveBeenCalled();
    expect(manager.getSaveState()).toBe(SaveState.CONFLICT);
  });

  it('should handle ConflictError', async () => {
    const saveFn = vi.fn().mockRejectedValue(new ConflictError());
    const onConflict = vi.fn();

    const manager = new AutoSaveManager<TestData>({
      debounceMs: 3000,
      saveFunction: saveFn,
      callbacks: { onConflict }
    });

    manager.update('1', { id: '1', value: 10, version: 1 });

    vi.advanceTimersByTime(3000);
    
    try {
      await vi.runAllTimersAsync();
    } catch (error) {
      // Expected to throw
    }

    expect(onConflict).toHaveBeenCalled();
  });

  it('should handle general errors', async () => {
    const saveFn = vi.fn().mockRejectedValue(new Error('Network error'));
    const onError = vi.fn();

    const manager = new AutoSaveManager<TestData>({
      debounceMs: 3000,
      saveFunction: saveFn,
      callbacks: { onError }
    });

    manager.update('1', { id: '1', value: 10, version: 1 });

    vi.advanceTimersByTime(3000);
    
    try {
      await vi.runAllTimersAsync();
    } catch (error) {
      // Expected to throw
    }

    expect(onError).toHaveBeenCalled();
    expect(manager.getSaveState()).toBe(SaveState.ERROR);
  });

  it('should force save immediately', async () => {
    const saveFn = vi.fn().mockResolvedValue({ id: '1', value: 10, version: 2 });

    const manager = new AutoSaveManager<TestData>({
      debounceMs: 3000,
      saveFunction: saveFn
    });

    manager.update('1', { id: '1', value: 10, version: 1 });

    // Force save without waiting
    await manager.forceSave();

    expect(saveFn).toHaveBeenCalledTimes(1);
  });

  it('should prevent concurrent saves', async () => {
    const saveFn = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ id: '1', value: 10, version: 2 }), 1000))
    );

    const manager = new AutoSaveManager<TestData>({
      debounceMs: 3000,
      saveFunction: saveFn
    });

    manager.update('1', { id: '1', value: 10, version: 1 });

    vi.advanceTimersByTime(3000);
    const save1 = manager.forceSave();
    const save2 = manager.forceSave(); // Should be ignored

    await Promise.all([save1, save2]);

    expect(saveFn).toHaveBeenCalledTimes(1); // Only called once
  });

  it('should track unsaved changes', () => {
    const saveFn = vi.fn().mockResolvedValue({ id: '1', value: 10, version: 2 });

    const manager = new AutoSaveManager<TestData>({
      debounceMs: 3000,
      saveFunction: saveFn
    });

    expect(manager.hasUnsavedChanges()).toBe(false);
    expect(manager.getUnsavedCount()).toBe(0);

    manager.update('1', { id: '1', value: 10, version: 1 });

    expect(manager.hasUnsavedChanges()).toBe(true);
    expect(manager.getUnsavedCount()).toBe(1);
  });

  it('should update save state correctly', async () => {
    const saveFn = vi.fn().mockResolvedValue({ id: '1', value: 10, version: 2 });

    const manager = new AutoSaveManager<TestData>({
      debounceMs: 3000,
      saveFunction: saveFn
    });

    expect(manager.getSaveState()).toBe(SaveState.IDLE);

    manager.update('1', { id: '1', value: 10, version: 1 });
    vi.advanceTimersByTime(3000);

    // Check state during save
    expect(manager.getSaveState()).toBe(SaveState.SAVING);

    await vi.runAllTimersAsync();

    expect(manager.getSaveState()).toBe(SaveState.SAVED);
  });
});


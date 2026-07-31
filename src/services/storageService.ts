/**
 * StorageAdapter interface abstraction.
 * Allows decoupling application-level storage logic from specific storage backends.
 * Backends (e.g., LocalStorage, FileSystem, SQLite) implement this interface.
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  hasItem(key: string): Promise<boolean>;
  clear?(): Promise<void>;
}

/**
 * LocalStorageAdapter implements StorageAdapter using window.localStorage.
 * Serves as the primary local persistence mechanism for the Tauri webview environment.
 * Includes defensive checks for SSR/non-browser contexts and storage access errors.
 */
export class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return null;
      }
      return window.localStorage.getItem(key);
    } catch (err) {
      console.error(`[LocalStorageAdapter] Error reading key "${key}":`, err);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }
      window.localStorage.setItem(key, value);
    } catch (err) {
      console.error(`[LocalStorageAdapter] Error writing key "${key}":`, err);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }
      window.localStorage.removeItem(key);
    } catch (err) {
      console.error(`[LocalStorageAdapter] Error removing key "${key}":`, err);
    }
  }

  async hasItem(key: string): Promise<boolean> {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      return window.localStorage.getItem(key) !== null;
    } catch (err) {
      console.error(`[LocalStorageAdapter] Error checking existence of key "${key}":`, err);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }
      window.localStorage.clear();
    } catch (err) {
      console.error("[LocalStorageAdapter] Error clearing storage:", err);
    }
  }
}

/**
 * StorageService provides a clean, unified, async API for storage operations across modules.
 * Handles serialization/deserialization, fallback defaults, and corrupted data protection.
 * Backend implementation can be swapped (e.g. to SQLite or FS) by setting a new StorageAdapter.
 */
export class StorageService {
  private adapter: StorageAdapter;

  constructor(adapter: StorageAdapter = new LocalStorageAdapter()) {
    this.adapter = adapter;
  }

  /**
   * Replaces or updates the active storage adapter.
   * Useful when switching backends (e.g., from LocalStorage to SQLite or FileSystem).
   *
   * @param adapter Target StorageAdapter implementation.
   */
  setAdapter(adapter: StorageAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Retrieves the current storage adapter instance.
   */
  getAdapter(): StorageAdapter {
    return this.adapter;
  }

  /**
   * Loads and deserializes data for a given key.
   * If data does not exist, or JSON parsing fails (corrupted data), it safely returns
   * the provided defaultValue (or null if no defaultValue was provided) without crashing.
   *
   * @template T The expected type of stored data.
   * @param key Unique storage key string.
   * @param defaultValue Optional default value returned when key is absent or corrupted.
   * @returns Deserialized value of type T, or defaultValue / null.
   */
  async load<T>(key: string, defaultValue: T): Promise<T>;
  async load<T>(key: string, defaultValue?: T): Promise<T | null>;
  async load<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const rawData = await this.adapter.getItem(key);
      if (rawData === null || rawData === undefined) {
        return defaultValue ?? null;
      }

      try {
        return JSON.parse(rawData) as T;
      } catch (parseError) {
        console.warn(
          `[StorageService] Corrupted data for key "${key}". Falling back to default value.`,
          parseError
        );
        return defaultValue ?? null;
      }
    } catch (err) {
      console.error(`[StorageService] Failed to load key "${key}":`, err);
      return defaultValue ?? null;
    }
  }

  /**
   * Serializes and persists data for a given key.
   *
   * @template T Type of data to save.
   * @param key Unique storage key string.
   * @param data Data payload to store.
   */
  async save<T>(key: string, data: T): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      await this.adapter.setItem(key, serialized);
    } catch (err) {
      console.error(`[StorageService] Failed to save key "${key}":`, err);
    }
  }

  /**
   * Removes stored item for a given key.
   *
   * @param key Unique storage key string to remove.
   */
  async remove(key: string): Promise<void> {
    try {
      await this.adapter.removeItem(key);
    } catch (err) {
      console.error(`[StorageService] Failed to remove key "${key}":`, err);
    }
  }

  /**
   * Checks whether a key exists in storage.
   *
   * @param key Unique storage key string.
   * @returns Promise resolving to true if key exists, false otherwise.
   */
  async exists(key: string): Promise<boolean> {
    try {
      return await this.adapter.hasItem(key);
    } catch (err) {
      console.error(`[StorageService] Failed to check existence of key "${key}":`, err);
      return false;
    }
  }
}

/**
 * Global singleton instance of StorageService for application-wide use.
 */
export const storageService = new StorageService();

import { Versionable } from './types';

/**
 * Generate standard CRUD operations from a base URL
 */
export function createRestOperations<T extends Versionable>(baseUrl: string) {
  const operations = {
    get: async (id?: string): Promise<T | T[]> => {
      const url = id ? `${baseUrl}/${id}` : baseUrl;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GET ${url} failed: ${response.statusText}`);
      }

      return await response.json();
    },

    post: async (data: T): Promise<T> => {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        throw new Error('Conflict');
      }

      if (!response.ok) {
        throw new Error(`POST ${baseUrl} failed: ${response.statusText}`);
      }

      return await response.json();
    },

    put: async (data: T): Promise<T> => {
      if (!data.id) {
        throw new Error('ID is required for PUT operation');
      }

      const url = `${baseUrl}/${data.id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        throw new Error('Conflict');
      }

      if (!response.ok) {
        throw new Error(`PUT ${url} failed: ${response.statusText}`);
      }

      return await response.json();
    },

    save: async (data: T): Promise<T> => {
      // Auto-detect POST or PUT based on ID presence
      if (!data.id) {
        return operations.post(data);
      } else {
        return operations.put(data);
      }
    },

    delete: async (id: string): Promise<void> => {
      const url = `${baseUrl}/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`DELETE ${url} failed: ${response.statusText}`);
      }
    },
  };

  return operations;
}

/**
 * Check if error is a conflict error (409)
 */
export function isConflictError(error: any): boolean {
  if (error?.message === 'Conflict') {
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


import { apiClient } from '../config/api';

class RecipeService {
  constructor() {
    // In-memory cache: key -> { ts, data }
    this._cache = new Map();
    this._diskCachePrefix = 'recipes_cache_v1_';
    this._defaultTtl = 1000 * 60 * 5; // 5 minutes
  }
  /**
   * Get all recipes with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.category - Filter by category: 'makanan' | 'minuman'
   * @param {string} params.difficulty - Filter by difficulty: 'mudah' | 'sedang' | 'sulit'
   * @param {string} params.search - Search in name/description
   * @param {string} params.sort_by - Sort by field (default: 'created_at')
   * @param {string} params.order - Sort order: 'asc' | 'desc' (default: 'desc')
   * @returns {Promise}
   */
  async getRecipes(params = {}) {
    try {
      const key = JSON.stringify(params || {});

      // Check in-memory cache
      const cached = this._cache.get(key);
      const now = Date.now();
      if (cached && (now - cached.ts) < this._defaultTtl) {
        return { success: true, data: cached.data, pagination: cached.pagination, cached: true };
      }

      // Check disk cache (localStorage)
      try {
        const disk = localStorage.getItem(this._diskCachePrefix + key);
        if (disk) {
          const parsed = JSON.parse(disk);
          if (now - parsed.ts < this._defaultTtl) {
            // populate in-memory and return
            this._cache.set(key, { ts: parsed.ts, data: parsed.data, pagination: parsed.pagination });
            return { success: true, data: parsed.data, pagination: parsed.pagination, cached: true };
          }
        }
      } catch (e) {
        // ignore localStorage errors
        console.warn('RecipeService disk cache error', e);
      }

      const response = await apiClient.get('/api/v1/recipes', { params });
      if (response && response.success) {
        // store in caches
        try {
          this._cache.set(key, { ts: now, data: response.data, pagination: response.pagination || null });
          localStorage.setItem(this._diskCachePrefix + key, JSON.stringify({ ts: now, data: response.data, pagination: response.pagination || null }));
        } catch (e) {
          // ignore cache write errors
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recipe by ID
   * @param {string} id - Recipe ID
   * @returns {Promise}
   */
  async getRecipeById(id) {
    try {
      const response = await apiClient.get(`/api/v1/recipes/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new recipe
   * @param {Object} recipeData - Recipe data
   * @returns {Promise}
   */
  async createRecipe(recipeData) {
    try {
      const response = await apiClient.post('/api/v1/recipes', recipeData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing recipe (full replacement)
   * @param {string} id - Recipe ID
   * @param {Object} recipeData - Complete recipe data (all fields required)
   * @returns {Promise}
   */
  async updateRecipe(id, recipeData) {
    try {
      const response = await apiClient.put(`/api/v1/recipes/${id}`, recipeData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Partially update recipe (only send fields to update)
   * @param {string} id - Recipe ID
   * @param {Object} partialData - Partial recipe data (only fields to update)
   * @returns {Promise}
   */
  async patchRecipe(id, partialData) {
    try {
      const response = await apiClient.patch(`/api/v1/recipes/${id}`, partialData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete recipe
   * @param {string} id - Recipe ID
   * @returns {Promise}
   */
  async deleteRecipe(id) {
    try {
      const response = await apiClient.delete(`/api/v1/recipes/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new RecipeService();
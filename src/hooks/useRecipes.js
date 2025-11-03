import { useState, useEffect, useCallback } from 'react';
import recipeService from '../services/recipeService';

// In-memory cache for single recipe fetching (ADDED)
const recipeCache = new Map();

/**
 * Custom hook for fetching recipes
 * @param {Object} params - Query parameters
 * @returns {Object} - { recipes, loading, error, pagination, refetch }
 */
export function useRecipes(params = {}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await recipeService.getRecipes(params);
      
      if (response.success) {
        setRecipes(response.data || []);
        setPagination(response.pagination || null);

        // Cache individual recipes from list for later detail view (MODIFIED)
        (response.data || []).forEach(recipe => {
            if (recipe.id && !recipeCache.has(recipe.id)) {
                recipeCache.set(recipe.id, recipe);
            }
        });

      } else {
        setError(response.message || 'Failed to fetch recipes');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching recipes');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    pagination,
    refetch: fetchRecipes,
  };
}

/**
 * Custom hook for fetching a single recipe
 * @param {string} id - Recipe ID
 * @returns {Object} - { recipe, loading, error, refetch }
 */
export function useRecipe(id) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Check cache first (MODIFIED)
    if (recipeCache.has(id)) {
      setRecipe(recipeCache.get(id));
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await recipeService.getRecipeById(id);
      
      if (response.success) {
        setRecipe(response.data);
        recipeCache.set(id, response.data); // Store in cache (MODIFIED)
      } else {
        setError(response.message || 'Failed to fetch recipe');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching recipe');
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  return {
    recipe,
    loading,
    error,
    refetch: fetchRecipe,
  };
}
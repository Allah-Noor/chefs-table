import { useState, useEffect } from 'react';

/**
 * useTrendingRecipes Hook
 * Fetches a list of recipes to display in the "Trending" section.
 * * Note: The TheMealDB API does not provide a bulk "random" endpoint,
 * so this hook simulates fetching a list by triggering multiple 
 * parallel requests.
 * * @returns {Object} { recipes, loading, error }
 */
export const useTrendingRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        
        // Create an array of 8 independent fetch promises to get multiple random meals
        const promises = Array.from({ length: 8 }).map(() =>
          fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(res => res.json())
        );
        
        // Execute requests in parallel to reduce wait time
        const results = await Promise.all(promises);
        
        // Map over results to extract the actual meal object from the API wrapper
        const data = results.map(res => res.meals[0]);
        
        setRecipes(data);
      } catch (err) {
        console.error("Trending fetch error:", err);
        setError("Failed to load trending recipes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return { recipes, loading, error };
};
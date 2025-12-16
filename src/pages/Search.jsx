import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import RecipeCard from "../components/ui/RecipeCard";
import Skeleton from "../components/ui/Skeleton";
import Button from "../components/ui/Button";
import { searchCustomRecipes } from "../libs/db";

/**
 * Search Page Component
 * Performs a unified search across two data sources:
 * 1. TheMealDB API (Public recipes)
 * 2. Firestore (Custom user recipes)
 * * Results are merged into a single list, with custom recipes displayed first.
 */
const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query);

  // --- Data Fetching ---

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!query) return;

      setLoading(true);
      try {
        // Execute both fetches in parallel for better performance
        const [apiRes, customRecipes] = await Promise.all([
          fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`).then((res) => res.json()),
          searchCustomRecipes(query), 
        ]);

        const apiMeals = apiRes.meals || [];

        // MERGE: Display Custom recipes first, followed by API recipes
        setRecipes([...customRecipes, ...apiMeals]);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
    setSearchTerm(query);
  }, [query]);

  // --- Handlers ---

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
    }
  };

  // Helper to determine the page title based on query type
  const getPageTitle = () => {
    if (loading) return "Loading...";
    
    const standardCategories = ["Beef", "Chicken", "Dessert", "Pasta", "Seafood", "Vegetarian", "Breakfast"];
    if (standardCategories.includes(query)) {
      return `${query} Recipes`;
    }
    return `Results for "${query}"`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header & Search Bar */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-500 hover:text-orange-600 mb-6 transition"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Home
        </Link>

        <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl">
          <div className="relative flex grow">
            <SearchIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for recipes..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition text-lg"
            />
          </div>
          <Button type="submit" className="px-8">
            Search
          </Button>
        </form>
      </div>

      {/* Dynamic Title */}
      <div className="mb-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900 capitalize">
          {getPageTitle()}
        </h1>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.idMeal} recipe={recipe} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900">No recipes found</h2>
          <p className="text-gray-500">Try searching for something else.</p>
        </div>
      )}
    </div>
  );
};

export default Search;
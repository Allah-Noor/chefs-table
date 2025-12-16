import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Clock, Users, ArrowLeft, Heart, PlayCircle, ChefHat, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// Database & API Utilities
import {
  addToFavorites, 
  removeFromFavorites, 
  checkFavoriteStatus, 
  getCustomRecipe,
  addToMealPlan 
} from "../libs/db";

// UI Components
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import Comments from "../components/ui/Comments"; 
import AddToPlanModal from "../components/ui/AddToPlanModal"; 

/**
 * RecipeDetails Page
 * Displays detailed information about a specific recipe.
 * * * Data Sources: 
 * 1. TheMealDB API (Public recipes, typically numeric IDs)
 * 2. Firestore (Custom user recipes, typically alphanumeric IDs)
 */
const RecipeDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();

  // State
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // --- Data Fetching ---

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let foundRecipe = null;

        // 1. Attempt External API Fetch (Optimization: Only if ID looks numeric)
        try {
          if (!isNaN(id)) {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const data = await res.json();
            if (data.meals) foundRecipe = data.meals[0];
          }
        } catch (err) { 
          console.warn("External API lookup failed, falling back to local DB."); 
        }

        // 2. Fallback to Firestore if not found externally
        if (!foundRecipe) {
          foundRecipe = await getCustomRecipe(id);
        }

        // 3. Update State & Check Favorites
        if (foundRecipe) {
          setRecipe(foundRecipe);
          if (currentUser) {
            const status = await checkFavoriteStatus(currentUser.uid, foundRecipe.idMeal);
            setIsFavorite(status);
          }
        } else { 
          toast.error("Recipe not found."); 
        }

      } catch (error) { 
        console.error(error);
        toast.error("Failed to load recipe data."); 
      } finally { 
        setLoading(false); 
      }
    };

    fetchData();
  }, [id, currentUser]);

  // --- Helpers ---

  /**
   * Extracts ingredients from TheMealDB's flat structure (strIngredient1...20)
   * into a clean array of objects.
   */
  const getIngredients = (meal) => {
    if (!meal) return [];
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() !== "") {
        ingredients.push({ name: ingredient, measure: measure || "" });
      }
    }
    return ingredients;
  };

  // --- Handlers ---

  const handleToggleFavorite = async () => {
    if (!currentUser) return toast.error("You must be logged in to save recipes.");
    
    try {
      setFavLoading(true);
      if (isFavorite) {
        await removeFromFavorites(currentUser.uid, recipe.idMeal);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await addToFavorites(currentUser.uid, recipe);
        setIsFavorite(true);
        toast.success("Added to favorites!");
      }
    } catch (error) { 
      toast.error("Failed to update favorites."); 
    } finally { 
      setFavLoading(false); 
    }
  };

  const handleAddToPlan = async (date, slot) => {
    if (!currentUser) return toast.error("Please login to use the planner");
    try {
      await addToMealPlan(currentUser.uid, date, slot, recipe);
      toast.success("Added to Meal Planner");
    } catch (error) {
      console.error(error);
      toast.error("Failed to schedule recipe");
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <Skeleton className="h-60 w-full rounded-2xl" />
            <Skeleton className="h-60 w-full col-span-2 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!recipe) return <div className="text-center py-20 font-bold text-gray-500">Recipe not found.</div>;

  const ingredients = getIngredients(recipe);

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Navigation */}
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-orange-600 mb-6 transition">
        <ArrowLeft size={20} className="mr-2" /> Back to Recipes
      </Link>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl bg-gray-100">
          <img 
            src={recipe.strMealThumb || "https://placehold.co/600x400?text=No+Image"} 
            alt={recipe.strMeal} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full font-bold text-gray-800 shadow-sm">
            {recipe.strCategory || "Custom"}
          </div>
        </div>

        {/* Info & Actions */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
            {recipe.strMeal}
          </h1>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
              {recipe.author ? recipe.author.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="text-sm text-gray-500">
              Created by <span className="font-semibold text-gray-900">{recipe.author?.split("@")[0] || "Community"}</span>
            </span>
          </div>

          <div className="flex items-center gap-8 mb-8 text-gray-600">
            <div className="flex items-center gap-2"><Clock className="text-orange-500" /><span className="font-medium">{recipe.cookingTime || "45 mins"}</span></div>
            <div className="flex items-center gap-2"><Users className="text-orange-500" /><span className="font-medium">{recipe.servings || "4 People"}</span></div>
            <div className="flex items-center gap-2"><ChefHat className="text-orange-500" /><span className="font-medium">{recipe.difficulty || "Easy"}</span></div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleToggleFavorite} variant={isFavorite ? "primary" : "outline"} className="flex-1 gap-2" isLoading={favLoading}>
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} /> {isFavorite ? "Saved" : "Save Recipe"}
            </Button>

            <Button variant="outline" onClick={() => setIsPlanModalOpen(true)} className="px-4 border-gray-300" title="Add to Meal Plan">
              <Calendar size={20} />
            </Button>

            {recipe.strYoutube && (
              <a href={recipe.strYoutube} target="_blank" rel="noreferrer" className="flex-1">
                <Button variant="secondary" className="w-full gap-2"><PlayCircle size={20} /> Watch Video</Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar: Ingredients */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b pb-4">Ingredients</h3>
            {ingredients.length > 0 ? (
              <ul className="space-y-4">
                {ingredients.map((item, index) => (
                  <li key={index} className="flex items-center justify-between text-gray-700">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">{item.measure}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-500 italic">No specific ingredients listed.</p>}
          </div>
        </div>

        {/* Main: Instructions */}
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Instructions</h3>
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            {/* Split instructions by newline to create paragraphs */}
            {recipe.strInstructions && recipe.strInstructions.split("\n").map((step, index) => (
              step.trim() !== "" && <p key={index} className="mb-4">{step}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12">
        <Comments recipeId={id} />
      </div>

      {/* Modals */}
      <AddToPlanModal 
        isOpen={isPlanModalOpen} 
        onClose={() => setIsPlanModalOpen(false)} 
        onSave={handleAddToPlan}
        recipeTitle={recipe.strMeal}
      />
    </div>
  );
};

export default RecipeDetails;
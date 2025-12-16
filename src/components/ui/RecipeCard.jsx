import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Trash2 } from 'lucide-react';

const RecipeCard = ({ recipe, onRemove }) => {
  return (
    <div className="relative group">
      
      {/* 1. The Remove Button (Only shows if onRemove is provided) */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault(); 
            onRemove(recipe.idMeal);
          }}
          className="absolute top-2 right-2 z-10 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm opacity-0 group-hover:opacity-100"
          title="Remove from favorites"
        >
          <Trash2 size={18} />
        </button>
      )}

      {/* 2. The Main Card Link */}
      <Link 
        to={`/recipe/${recipe.idMeal}`}
        className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
      >
        <div className="relative h-48 overflow-hidden">
          <img 
            src={recipe.strMealThumb || "https://placehold.co/600x400?text=No+Image"} 
            alt={recipe.strMeal} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
            loading="lazy"
            onError={(e) => {
               e.target.onerror = null; 
               e.target.src = "https://placehold.co/600x400?text=No+Image"; 
            }}
          />
          {/* Category Tag */}
          {!onRemove && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
              {recipe.strCategory || "Custom"}
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-serif text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {recipe.strMeal}
          </h3>
          <p className="text-sm text-gray-500 mb-4">{recipe.strArea || 'International'} Cuisine</p>

          {/* --- UPDATED: REAL DATA --- */}
          <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-1">
              <Clock size={14} /> 
              {/* Show Real Time if available, else default */}
              {recipe.cookingTime || "30 mins"}
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} /> 
              {/* Show Real Servings if available, else default */}
              {recipe.servings || "2 Servings"}
            </div>
          </div>
          {/* -------------------------- */}
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard;
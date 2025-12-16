import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createRecipe } from '../libs/db';
import Button from '../components/ui/Button';
import { ChefHat, Link as LinkIcon, AlignLeft, Image as ImageIcon, Clock, Users, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * CreateRecipe Page
 * Allows authenticated users to submit custom recipes.
 * * Manages a dynamic list of ingredients.
 * * transforms data to match TheMealDB schema before saving to Firestore.
 */
const CreateRecipe = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Dynamic state for ingredient rows
  const [ingredients, setIngredients] = useState([
    { name: '', measure: '' }, 
    { name: '', measure: '' }
  ]);

  const [formData, setFormData] = useState({
    strMeal: '',
    strMealThumb: '',
    strCategory: 'Beef',
    strArea: 'Unknown',
    strInstructions: '',
    strYoutube: '',
    cookingTime: '', 
    servings: '',
    difficulty: 'Easy' 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Ingredient Management ---

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', measure: '' }]);
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  // --- Submission ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formData.strMeal || !formData.strInstructions) {
      return toast.error("Please fill in the required fields");
    }

    try {
      setLoading(true);

      // Transform dynamic ingredients array into a flat object structure 
      // (e.g., strIngredient1, strMeasure1) to ensure compatibility with 
      // TheMealDB API schema used throughout the rest of the application.
      const ingredientMap = {};
      ingredients.forEach((ing, i) => {
        if (ing.name.trim()) {
          ingredientMap[`strIngredient${i + 1}`] = ing.name;
          ingredientMap[`strMeasure${i + 1}`] = ing.measure;
        }
      });
      
      const recipePayload = {
        ...formData,
        ...ingredientMap,
        userId: currentUser.uid,
        author: currentUser.email,
        idMeal: Date.now().toString(),
        isCustom: true
      };

      await createRecipe(recipePayload);
      
      toast.success("Recipe published successfully!");
      navigate('/'); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
          <ChefHat size={32} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-900">Share Your Recipe</h1>
        <p className="text-gray-500 mt-2">Contribute your culinary masterpiece to the community.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Info</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Title *</label>
              <input 
                name="strMeal"
                type="text" 
                required
                placeholder="e.g., Grandma's Apple Pie"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition"
                value={formData.strMeal}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    name="strMealThumb"
                    type="url" 
                    placeholder="https://..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition"
                    value={formData.strMealThumb}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  name="strCategory"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition bg-white"
                  value={formData.strCategory}
                  onChange={handleChange}
                >
                  <option>Beef</option>
                  <option>Chicken</option>
                  <option>Dessert</option>
                  <option>Pasta</option>
                  <option>Vegetarian</option>
                  <option>Breakfast</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Details (Time, Serving, Difficulty) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cooking Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cooking Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    name="cookingTime"
                    type="text" 
                    placeholder="e.g. 45 mins"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition"
                    value={formData.cookingTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Servings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    name="servings"
                    type="text" 
                    placeholder="e.g. 4 people"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition"
                    value={formData.servings}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select 
                  name="difficulty"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition bg-white"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Ingredients (Dynamic List) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Ingredients</h3>
            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Ingredient (e.g. Flour)"
                    className="flex grow px-4 py-2 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Measure (e.g. 2 cups)"
                    className="w-1/3 px-4 py-2 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                    value={ing.measure}
                    onChange={(e) => handleIngredientChange(index, 'measure', e.target.value)}
                  />
                  {ingredients.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
              
              <Button type="button" variant="ghost" onClick={addIngredient} className="w-full border-dashed border-2 border-gray-300 text-gray-500">
                <Plus size={18} /> Add Ingredient
              </Button>
            </div>
          </div>

          {/* Section 4: Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Instructions</h3>
            <div>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <textarea 
                  name="strInstructions"
                  required
                  rows="6"
                  placeholder="Step 1: Preheat oven...&#10;Step 2: Mix ingredients..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition resize-none"
                  value={formData.strInstructions}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

           {/* Youtube Link */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video (Optional)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                name="strYoutube"
                type="url" 
                placeholder="https://youtube.com/..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition"
                value={formData.strYoutube}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-4 text-lg" isLoading={loading}>
            Publish Recipe
          </Button>

        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;
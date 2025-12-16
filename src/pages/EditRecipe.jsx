import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomRecipe, updateRecipe } from '../libs/db';
import Button from '../components/ui/Button';
import { ChefHat, Link as LinkIcon, AlignLeft, Image as ImageIcon, Clock, Users, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * EditRecipe Component
 * Allows users to update an existing custom recipe.
 * * Key Logic: 
 * 1. Fetches data by ID on mount.
 * 2. Transforms flat API ingredient fields (strIngredient1...20) into an array for the UI.
 * 3. Transforms the array back into flat fields on submit, ensuring removed ingredients are cleared.
 */
const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [ingredients, setIngredients] = useState([]);
  const [formData, setFormData] = useState({
    strMeal: '', strMealThumb: '', strCategory: 'Beef',
    strInstructions: '', strYoutube: '', cookingTime: '', 
    servings: '', difficulty: 'Easy'
  });

  // --- 1. Fetch & Populate Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCustomRecipe(id);
        if (data) {
          // Populate basic form fields
          setFormData({
            strMeal: data.strMeal,
            strMealThumb: data.strMealThumb,
            strCategory: data.strCategory,
            strInstructions: data.strInstructions,
            strYoutube: data.strYoutube,
            cookingTime: data.cookingTime || '',
            servings: data.servings || '',
            difficulty: data.difficulty || 'Easy'
          });

          // Logic: Extract Ingredients from flat keys (strIngredient1 -> 20) back into an array
          const loadedIngredients = [];
          for (let i = 1; i <= 20; i++) {
            const name = data[`strIngredient${i}`];
            const measure = data[`strMeasure${i}`];
            
            if (name && name.trim() !== "") {
              loadedIngredients.push({ name, measure });
            }
          }
          // Ensure at least one empty row if no ingredients found
          setIngredients(loadedIngredients.length ? loadedIngredients : [{ name: '', measure: '' }]);
        } else {
          toast.error("Recipe not found");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error(error);
        toast.error("Could not load recipe");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // --- 2. Form Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', measure: '' }]);
  
  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

  // --- 3. Submission Logic ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Logic: Reset all 20 ingredient slots to empty strings first.
      // This ensures that if a user deletes an ingredient (e.g., goes from 5 items to 3),
      // the old items (4 and 5) are wiped from the database.
      const ingredientMap = {};
      for(let i=1; i<=20; i++) { 
        ingredientMap[`strIngredient${i}`] = ""; 
        ingredientMap[`strMeasure${i}`] = ""; 
      }

      // Fill slots with current state
      ingredients.forEach((ing, i) => {
        if (ing.name.trim()) {
          ingredientMap[`strIngredient${i + 1}`] = ing.name;
          ingredientMap[`strMeasure${i + 1}`] = ing.measure;
        }
      });
      
      const updatePayload = {
        ...formData,
        ...ingredientMap, 
      };

      await updateRecipe(id, updatePayload);
      toast.success("Recipe updated!");
      navigate('/dashboard'); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to update recipe");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600" size={40} /></div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
          <ChefHat size={32} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-900">Edit Recipe</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-8">
           
           {/* Section 1: Basic Info */}
           <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Info</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Title</label>
              <input 
                name="strMeal" 
                value={formData.strMeal} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition" 
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    name="strMealThumb" 
                    value={formData.strMealThumb} 
                    onChange={handleChange} 
                    placeholder="Image URL" 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  name="strCategory" 
                  value={formData.strCategory} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition bg-white"
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

           {/* Section 2: Details */}
           <div className="space-y-4">
             <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cooking Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input name="cookingTime" value={formData.cookingTime} onChange={handleChange} placeholder="e.g. 45 mins" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" />
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input name="servings" value={formData.servings} onChange={handleChange} placeholder="e.g. 4 people" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" />
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none bg-white">
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
               </div>
             </div>
           </div>

           {/* Section 3: Ingredients */}
           <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Ingredients</h3>
              <div className="space-y-3">
                {ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-3">
                    <input 
                      value={ing.name} 
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} 
                      className="flex grow px-4 py-2 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" 
                      placeholder="Ingredient Name" 
                    />
                    <input 
                      value={ing.measure} 
                      onChange={(e) => handleIngredientChange(index, 'measure', e.target.value)} 
                      className="w-1/3 px-4 py-2 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" 
                      placeholder="Measure" 
                    />
                    <button type="button" onClick={() => removeIngredient(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={20} />
                    </button>
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
             <div className="relative">
                <AlignLeft className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <textarea 
                  name="strInstructions" 
                  value={formData.strInstructions} 
                  onChange={handleChange} 
                  rows="6" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none resize-none" 
                  placeholder="Cooking instructions..." 
                />
             </div>
           </div>

           {/* Youtube Link */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input name="strYoutube" value={formData.strYoutube} onChange={handleChange} placeholder="https://youtube.com/..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" />
            </div>
           </div>

          <Button type="submit" className="w-full py-4 text-lg">Update Recipe</Button>
        </form>
      </div>
    </div>
  );
};

export default EditRecipe;
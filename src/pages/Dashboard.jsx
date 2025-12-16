import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRecipes, deleteRecipe, deleteUserData } from '../libs/db';
import { updateProfile, deleteUser } from 'firebase/auth';
import Button from '../components/ui/Button';
import { PlusCircle, Edit, Trash2, ChefHat, Loader2, User, Settings, LogOut, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Dashboard Component
 * The central hub for authenticated users.
 * * Features:
 * 1. View and manage user-created recipes.
 * 2. Update user profile (display name, photo URL).
 * 3. Account management (Logout, Delete Account).
 */
const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // UI State
  const [activeTab, setActiveTab] = useState('recipes');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Data State
  const [recipes, setRecipes] = useState([]);
  
  // Profile Form State
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');

  // --- Data Fetching ---

  useEffect(() => {
    const fetchMyRecipes = async () => {
      if (currentUser) {
        try {
          const data = await getMyRecipes(currentUser.uid);
          setRecipes(data);
        } catch (error) {
          toast.error("Failed to load recipes");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMyRecipes();
  }, [currentUser]);

  // --- Handlers ---

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm("Delete this recipe permanently?")) {
      try {
        await deleteRecipe(recipeId);
        setRecipes(prev => prev.filter(r => r.idMeal !== recipeId));
        toast.success("Recipe deleted");
      } catch (error) {
        toast.error("Failed to delete recipe");
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile(currentUser, {
        displayName: displayName,
        photoURL: photoURL
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure? This will permanently delete your account and all recipes.")) {
      try {
        setIsUpdating(true);
        // Clean up Firestore data first
        await deleteUserData(currentUser.uid);
        // Then remove Auth account
        await deleteUser(currentUser);
        
        toast.success("Account deleted.");
        navigate('/');
      } catch (error) {
        console.error(error);
        toast.error("Login again to verify before deleting.");
      }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600" size={40} /></div>;

  return (
    <div className="container mx-auto px-4 py-10">
      
      {/* --- User Header Section --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        
        {/* Profile Picture */}
        <div className="flex shrink-0 w-24 h-24 rounded-full bg-orange-100 border-4 border-white shadow-md overflow-hidden items-center justify-center text-3xl font-bold text-orange-600">
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            currentUser.email?.charAt(0).toUpperCase()
          )}
        </div>

        {/* User Info */}
        <div className="grow text-center md:text-left flex flex-col justify-center h-24"> 
          <h1 className="text-3xl font-serif font-bold text-gray-900 leading-tight mb-1">
            {currentUser.displayName || "Chef"}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500">
            <User size={16} />
            <span className="text-sm font-medium">{currentUser.email}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 bg-gray-50 p-1 rounded-xl self-center md:self-start mt-4 md:mt-2">
          <button 
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'recipes' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            My Recipes
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'profile' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* --- TAB 1: MY RECIPES --- */}
      {activeTab === 'recipes' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Manage Recipes</h2>
            <Link to="/create">
              <Button className="gap-2 text-sm"><PlusCircle size={18} /> New Recipe</Button>
            </Link>
          </div>

          {recipes.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-gray-600">Recipe</th>
                    <th className="p-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Category</th>
                    <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recipes.map((recipe) => (
                    <tr key={recipe.idMeal} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-900">
                        <Link to={`/recipe/${recipe.idMeal}`} className="flex items-center gap-3 hover:text-orange-600">
                          <img src={recipe.strMealThumb} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                          {recipe.strMeal}
                        </Link>
                      </td>
                      <td className="p-4 text-gray-500 hidden md:table-cell">{recipe.strCategory}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/edit/${recipe.idMeal}`}>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <Edit size={18} />
                            </button>
                          </Link>
                          <button onClick={() => handleDeleteRecipe(recipe.idMeal)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <ChefHat className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 mb-6">No recipes yet.</p>
              <Link to="/create"><Button>Create Recipe</Button></Link>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: PROFILE SETTINGS --- */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Profile Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings size={20} /> Edit Profile
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                    placeholder="Your Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="url" 
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                    placeholder="https://example.com/my-photo.jpg"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" isLoading={isUpdating}>Save Changes</Button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 p-8 rounded-2xl border border-red-100">
            <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
              <LogOut size={20} /> Danger Zone
            </h2>
            <p className="text-red-600 mb-6 text-sm">
              Deleting your account is permanent. All your recipes will be erased.
            </p>
            <button 
              onClick={handleDeleteAccount}
              className="bg-white border border-red-200 text-red-600 px-6 py-2.5 rounded-xl font-medium hover:bg-red-600 hover:text-white transition shadow-sm"
            >
              Delete My Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
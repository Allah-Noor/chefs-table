import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc,
  query,
  where,
  writeBatch,
  orderBy,
  limit,
  deleteField 
} from 'firebase/firestore'; 

// --- Favorites Management ---

/**
 * Adds a recipe to the user's favorites sub-collection.
 * @param {string} userId - The current user's ID.
 * @param {object} recipe - The full recipe object to save.
 */
export const addToFavorites = async (userId, recipe) => {
  const favoriteRef = doc(db, 'users', userId, 'favorites', recipe.idMeal);
  await setDoc(favoriteRef, {
    idMeal: recipe.idMeal,
    strMeal: recipe.strMeal,
    strMealThumb: recipe.strMealThumb,
    strCategory: recipe.strCategory,
    strArea: recipe.strArea
  });
};

export const removeFromFavorites = async (userId, recipeId) => {
  const favoriteRef = doc(db, 'users', userId, 'favorites', recipeId);
  await deleteDoc(favoriteRef);
};

export const checkFavoriteStatus = async (userId, recipeId) => {
  const favoriteRef = doc(db, 'users', userId, 'favorites', recipeId);
  const docSnap = await getDoc(favoriteRef);
  return docSnap.exists();
};

export const getFavorites = async (userId) => {
  const favoritesRef = collection(db, 'users', userId, 'favorites');
  const snapshot = await getDocs(favoritesRef);
  return snapshot.docs.map(doc => doc.data());
};

// --- Custom Recipes (CRUD) ---

export const createRecipe = async (recipeData) => {
  const docRef = await addDoc(collection(db, 'custom_recipes'), {
    ...recipeData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

/**
 * Searches custom recipes.
 * Note: Performs client-side filtering because Firestore does not support 
 * native substring search (SQL 'LIKE').
 */
export const searchCustomRecipes = async (searchQuery) => {
  try {
    const recipesRef = collection(db, 'custom_recipes');
    const snapshot = await getDocs(recipesRef);
    
    const allRecipes = snapshot.docs.map(doc => ({ 
      ...doc.data(), 
      idMeal: doc.id 
    }));

    const lowerQuery = searchQuery.toLowerCase();

    return allRecipes.filter(recipe => 
      recipe.strMeal.toLowerCase().includes(lowerQuery) || 
      (recipe.strCategory && recipe.strCategory.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error("Error searching custom recipes:", error);
    return [];
  }
};

/**
 * Fetches a single custom recipe.
 * Attempts to find by Document ID first; falls back to querying the 'idMeal' field.
 */
export const getCustomRecipe = async (id) => {
  try {
    const docRef = doc(db, 'custom_recipes', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { ...docSnap.data(), idMeal: docSnap.id };
    }
    
    // Fallback query
    const q = query(collection(db, 'custom_recipes'), where("idMeal", "==", id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching custom recipe:", error);
    return null;
  }
};

export const getMyRecipes = async (userId) => {
  const recipesRef = collection(db, 'custom_recipes');
  const q = query(recipesRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    idMeal: doc.id
  }));
};

export const deleteRecipe = async (recipeId) => {
  const docRef = doc(db, 'custom_recipes', recipeId);
  await deleteDoc(docRef);
};

export const updateRecipe = async (recipeId, updatedData) => {
  const docRef = doc(db, 'custom_recipes', recipeId);
  await updateDoc(docRef, updatedData);
};

/**
 * Fetches the 8 most recently created community recipes.
 */
export const getLatestCustomRecipes = async () => {
  try {
    const recipesRef = collection(db, 'custom_recipes');
    const q = query(recipesRef, orderBy('createdAt', 'desc'), limit(8));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      idMeal: doc.id
    }));
  } catch (error) {
    console.error("Error fetching community recipes:", error);
    return [];
  }
};

/**
 * Deletes all data associated with a user (Recipes and User Profile).
 * Uses a batch write to ensure atomicity.
 */
export const deleteUserData = async (userId) => {
  const batch = writeBatch(db);

  // Delete user's custom recipes
  const recipesRef = collection(db, 'custom_recipes');
  const q = query(recipesRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Delete user profile
  const userRef = doc(db, 'users', userId);
  batch.delete(userRef);
  
  await batch.commit();
};

// --- Comments System ---

export const addComment = async (recipeId, commentData) => {
  await addDoc(collection(db, 'comments'), {
    ...commentData,
    recipeId: String(recipeId),
    createdAt: new Date().toISOString()
  });
};

/**
 * Fetches comments for a specific recipe.
 * Note: Sorting is done in JavaScript to avoid requiring a composite index 
 * in Firestore for every deployment.
 */
export const getComments = async (recipeId) => {
  const commentsRef = collection(db, 'comments');
  
  const q = query(
    commentsRef, 
    where("recipeId", "==", String(recipeId))
  );
  
  const snapshot = await getDocs(q);
  
  const comments = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));

  // Sort: Newest First
  return comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const deleteComment = async (commentId) => {
  await deleteDoc(doc(db, 'comments', commentId));
};

// --- Meal Planner ---

/**
 * Adds or updates a meal slot for a specific date.
 * @param {string} date - Format YYYY-MM-DD
 * @param {string} slot - e.g., 'breakfast', 'lunch', 'dinner'
 */
export const addToMealPlan = async (userId, date, slot, recipe) => {
  const planRef = doc(db, 'users', userId, 'meal_plan', date);
  // Merge true allows adding 'lunch' without overwriting existing 'breakfast'
  await setDoc(planRef, {
    [slot]: {
      idMeal: recipe.idMeal,
      strMeal: recipe.strMeal,
      strMealThumb: recipe.strMealThumb
    }
  }, { merge: true });
};

export const getMealPlan = async (userId) => {
  const planRef = collection(db, 'users', userId, 'meal_plan');
  const snapshot = await getDocs(planRef);
  
  const plan = {};
  snapshot.docs.forEach(doc => {
    plan[doc.id] = doc.data();
  });
  return plan;
};

export const removeFromMealPlan = async (userId, date, slot) => {
  const planRef = doc(db, 'users', userId, 'meal_plan', date);
  await updateDoc(planRef, {
    [slot]: deleteField()
  });
};
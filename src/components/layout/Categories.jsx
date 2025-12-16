import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beef, 
  UtensilsCrossed, 
  Coffee, 
  IceCream, 
  Carrot, 
  Fish, 
  Wheat, 
  Pizza 
} from 'lucide-react';

// Configuration for available food categories, icons, and theme colors
const categories = [
  { name: 'Beef', icon: <Beef />, color: 'bg-red-100 text-red-600' },
  { name: 'Chicken', icon: <UtensilsCrossed />, color: 'bg-orange-100 text-orange-600' },
  { name: 'Dessert', icon: <IceCream />, color: 'bg-pink-100 text-pink-600' },
  { name: 'Vegetarian', icon: <Carrot />, color: 'bg-green-100 text-green-600' },
  { name: 'Seafood', icon: <Fish />, color: 'bg-blue-100 text-blue-600' },
  { name: 'Breakfast', icon: <Coffee />, color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Pasta', icon: <Wheat />, color: 'bg-amber-100 text-amber-600' },
  { name: 'Miscellaneous', icon: <Pizza />, color: 'bg-purple-100 text-purple-600' },
];

/**
 * Categories Component
 * * Renders a responsive grid of category buttons.
 * Clicking a category navigates the user to the search page with the selected filter.
 */
const Categories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/search?q=${categoryName}`);
  };

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-gray-900">Browse by Category</h2>
          <p className="text-gray-500 mt-2">Find the perfect dish for any occasion</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 text-2xl shadow-sm group-hover:scale-110 transition-transform ${cat.color}`}>
                {/* Clone element to enforce consistent icon sizing */}
                {React.cloneElement(cat.icon, { size: 28 })}
              </div>
              <span className="font-medium text-gray-700 group-hover:text-orange-600 transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Categories;
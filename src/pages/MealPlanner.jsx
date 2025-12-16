import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMealPlan, removeFromMealPlan } from '../libs/db';
import { 
  Loader2, 
  Trash2, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  ArrowLeft, 
  PlusCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * MealPlanner Component
 * Displays a weekly calendar view allowing users to manage their meal schedule.
 * * Features:
 * 1. Weekly view with date navigation (Previous/Next week).
 * 2. Slots for Breakfast, Lunch, and Dinner.
 * 3. Links to recipe details or the home page to add new meals.
 */
const MealPlanner = () => {
  const { currentUser } = useAuth();
  
  // State
  const [plan, setPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [startOfWeek, setStartOfWeek] = useState(new Date());

  // --- Data Fetching ---

  useEffect(() => {
    const fetchPlan = async () => {
      if (currentUser) {
        try {
          const data = await getMealPlan(currentUser.uid);
          setPlan(data);
        } catch (error) {
          console.error(error);
          toast.error("Failed to load meal plan");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPlan();
  }, [currentUser]);

  // --- Helpers & Handlers ---

  // Generate array of 7 days starting from startOfWeek state
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return {
      dateString: d.toISOString().split('T')[0], // ISO format for DB keys (YYYY-MM-DD)
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      fullDate: d
    };
  });

  const changeWeek = (days) => {
    const newDate = new Date(startOfWeek);
    newDate.setDate(newDate.getDate() + days);
    setStartOfWeek(newDate);
  };

  const handleRemove = async (date, slot) => {
    if (window.confirm("Clear this meal slot?")) {
      try {
        await removeFromMealPlan(currentUser.uid, date, slot);
        
        // Optimistic update: remove from local state immediately
        const newPlan = { ...plan };
        if (newPlan[date]) {
          delete newPlan[date][slot];
          setPlan(newPlan);
        }
        toast.success("Removed");
      } catch (error) {
        toast.error("Failed to remove");
      }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600" size={40} /></div>;

  return (
    <div className="container mx-auto px-4 py-10">
      
      {/* --- Header & Navigation --- */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="text-orange-600" /> Meal Planner
          </h1>
          <p className="text-gray-500 mt-2">Organize your weekly culinary journey</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <button onClick={() => changeWeek(-7)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <span className="font-medium text-gray-900 w-32 text-center">
            {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button onClick={() => changeWeek(7)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* --- Calendar Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayPlan = plan[day.dateString] || {};
          // Check for "Today" to highlight the specific column
          const isToday = new Date().toISOString().split('T')[0] === day.dateString;

          return (
            <div key={day.dateString} className={`flex flex-col gap-3 ${isToday ? 'md:-mt-4' : ''}`}>
              
              {/* Day Header */}
              <div className={`text-center p-3 rounded-xl border ${isToday ? 'bg-orange-600 text-white border-orange-600 shadow-md transform scale-105' : 'bg-white border-gray-100'}`}>
                <div className="text-xs font-bold uppercase opacity-80">{day.dayName}</div>
                <div className="text-xl font-bold">{day.dayNumber}</div>
              </div>

              {/* Meal Slots (Breakfast, Lunch, Dinner) */}
              <div className="space-y-2">
                {['breakfast', 'lunch', 'dinner'].map(slot => (
                  <div key={slot} className="bg-white rounded-xl border border-gray-100 p-3 min-h-[100px] flex flex-col relative group hover:shadow-md transition">
                    <span className="text-xs font-bold text-gray-400 uppercase mb-2 block">{slot}</span>
                    
                    {dayPlan[slot] ? (
                      // --- Filled Slot ---
                      <>
                        <Link to={`/recipe/${dayPlan[slot].idMeal}`} className="flex flex-col grow">
                          <img src={dayPlan[slot].strMealThumb} alt="" className="w-full h-16 object-cover rounded-lg mb-2" />
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                            {dayPlan[slot].strMeal}
                          </p>
                        </Link>
                        <button 
                          onClick={() => handleRemove(day.dateString, slot)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 shadow-sm transition"
                          title="Remove meal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      // --- Empty Slot ---
                      <Link to="/" className="grow flex items-center justify-center text-gray-200 hover:text-orange-300 transition">
                        <PlusCircle size={24} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MealPlanner;
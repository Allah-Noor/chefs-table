import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components
import Layout from "./components/layout/Layout";
import RouteGuard from "./components/RouteGuard";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RecipeDetails from "./pages/RecipeDetails";
import Favorites from "./pages/Favorites";
import Search from "./pages/Search";
import CreateRecipe from "./pages/CreateRecipe";
import Dashboard from "./pages/Dashboard";
import EditRecipe from "./pages/EditRecipe";
import MealPlanner from "./pages/MealPlanner";

/**
 * App Component
 * Serves as the application root.
 * * Configures the global routing structure using React Router.
 * * Wraps the app in the Layout component.
 * * Manages global toast notifications.
 */
function App() {
  return (
    <>
      {/* Global Notification Provider */}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <Routes>
        {/* Main Layout Wrapper */}
        <Route path="/" element={<Layout />}>
          
          {/* --- Public Routes --- */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="recipe/:id" element={<RecipeDetails />} />
          <Route path="search" element={<Search />} />

          {/* --- Protected Routes --- */}
          {/* These routes require authentication via RouteGuard */}
          
          <Route path="dashboard" element={
            <RouteGuard>
              <Dashboard />
            </RouteGuard>
          } />

          <Route path="edit/:id" element={
            <RouteGuard>
              <EditRecipe />
            </RouteGuard>
          } />

          <Route path="favorites" element={
            <RouteGuard>
              <Favorites />
            </RouteGuard>
          } />

          <Route path="create" element={
            <RouteGuard>
              <CreateRecipe />
            </RouteGuard>
          } />

          <Route path="planner" element={
            <RouteGuard>
              <MealPlanner />
            </RouteGuard>
          } />

        </Route>
      </Routes>
    </>
  );
}

export default App;
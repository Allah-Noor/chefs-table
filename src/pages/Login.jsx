import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

/**
 * Login Page
 * Handles user authentication via Email/Password.
 * * Uses the AuthContext to communicate with Firebase.
 * * Redirects to the homepage upon successful login.
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      await login(email, password);
      
      toast.success("Welcome back!");
      navigate('/');
    } catch (err) {
      console.error(err);
      setError("Failed to sign in. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-4">
            <LogIn size={24} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to access your recipes</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm mb-6 border border-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-3 text-lg" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center mt-8 text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
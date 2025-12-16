import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

/**
 * Signup Page
 * Handles new user registration.
 * * Features:
 * 1. Client-side validation (password matching, length).
 * 2. Firebase Authentication integration.
 * 3. Specific error handling for existing users.
 */
const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      setError('');
      setLoading(true);
      
      await signup(email, password);
      
      toast.success("Account created successfully!");
      navigate('/'); 
    } catch (err) {
      console.error(err);
      // specific Firebase error handling
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else {
        setError('Failed to create an account.');
      }
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
            <User size={24} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Join Chef'sTable</h2>
          <p className="text-gray-500 mt-2">Start your culinary journey today</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm mb-6 border border-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Registration Form */}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-3 text-lg" 
            isLoading={loading}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center mt-8 text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
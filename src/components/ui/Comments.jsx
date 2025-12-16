import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addComment, getComments, deleteComment } from '../../libs/db';
import Button from './Button';
import { Star, Trash2, MessageCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Comments = ({ recipeId }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getComments(recipeId);
        setComments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [recipeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentData = {
        text: newComment,
        rating: rating,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        userPhoto: currentUser.photoURL || null,
      };

      await addComment(recipeId, commentData);
      
      // Refresh list immediately (optimistic update would be better, but fetching is safe)
      const updatedComments = await getComments(recipeId);
      setComments(updatedComments);
      
      setNewComment('');
      setRating(5);
      toast.success("Review posted!");
    } catch (error) {
      toast.error("Failed to post review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm("Delete this comment?")) {
      try {
        await deleteComment(commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast.success("Deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  // Star Rating Helper
  const renderStars = (count) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < count ? "fill-orange-400 text-orange-400" : "text-gray-300"} 
      />
    ));
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mt-12">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-100 rounded-full text-orange-600">
           <MessageCircle size={24} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-900">
          Reviews ({comments.length})
        </h2>
      </div>

      {/* --- WRITE A REVIEW --- */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Leave a Review</h3>
          
          {/* Rating Selector */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`transition ${star <= rating ? "text-orange-500 scale-110" : "text-gray-300 hover:text-orange-300"}`}
                >
                  <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What did you think of this recipe?"
            className="w-full p-4 rounded-xl border border-gray-200 focus:border-orange-500 outline-none min-h-[100px] mb-4 bg-white"
            required
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={submitting}>Post Review</Button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-6 rounded-xl text-center mb-10">
          <p className="text-gray-500 mb-4">Log in to leave a review and share your thoughts.</p>
          <Button variant="outline" onClick={() => window.location.href='/login'}>Log In</Button>
        </div>
      )}

      {/* --- COMMENTS LIST --- */}
      {loading ? (
        <div className="text-center py-10">Loading reviews...</div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden">
                    {comment.userPhoto ? (
                      <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{comment.userName}</p>
                    <div className="flex gap-1 mt-0.5">
                      {renderStars(comment.rating)}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed mt-2 pl-14">
                {comment.text}
              </p>

              {/* Delete Button (Only for Author) */}
              {currentUser && currentUser.uid === comment.userId && (
                <div className="pl-14 mt-2">
                   <button 
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                   >
                     <Trash2 size={12} /> Delete
                   </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400 italic">
          No reviews yet. Be the first to try this recipe!
        </div>
      )}
    </div>
  );
};

export default Comments;
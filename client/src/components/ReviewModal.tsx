import React, { useState } from 'react';
import { X } from 'lucide-react';

type PriceAccuracy = 'accurate' | 'high' | 'low';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [priceAccuracy, setPriceAccuracy] = useState<PriceAccuracy>('accurate');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ rating, comment, priceAccuracy });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-background text-white rounded-xl p-8 w-full max-w-lg mx-4 relative shadow-xl transform transition-all">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-white hover:text-gray-300 transition-colors duration-200"
          type="button"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-bold mb-6 text-white">Add Review</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-lg font-medium text-white">Price Accuracy Rating</label>
            <div className="flex space-x-6">
              <label className="flex items-center text-white group cursor-pointer">
                <input
                  type="radio"
                  name="priceAccuracy"
                  value="accurate"
                  checked={priceAccuracy === 'accurate'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceAccuracy(e.target.value as PriceAccuracy)}
                  className="mr-3 h-4 w-4 cursor-pointer"
                />
                <span className="group-hover:text-gray-300 transition-colors duration-200">Accurate</span>
              </label>
              <label className="flex items-center text-white group cursor-pointer">
                <input
                  type="radio"
                  name="priceAccuracy"
                  value="high"
                  checked={priceAccuracy === 'high'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceAccuracy(e.target.value as PriceAccuracy)}
                  className="mr-3 h-4 w-4 cursor-pointer"
                />
                <span className="group-hover:text-gray-300 transition-colors duration-200">Too High</span>
              </label>
              <label className="flex items-center text-white group cursor-pointer">
                <input
                  type="radio"
                  name="priceAccuracy"
                  value="low"
                  checked={priceAccuracy === 'low'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceAccuracy(e.target.value as PriceAccuracy)}
                  className="mr-3 h-4 w-4 cursor-pointer"
                />
                <span className="group-hover:text-gray-300 transition-colors duration-200">Too Low</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-lg font-medium text-white">Rating (1-5)</label>
            <div className="flex space-x-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors duration-200 hover:scale-110 transform ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-lg font-medium text-white">Comment</label>
            <textarea
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-800 text-white 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                placeholder-gray-400"
              rows={4}
              placeholder="Enter your comment..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-white hover:text-gray-300 transition-colors duration-200
                border border-transparent hover:border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                transition-colors duration-200 font-medium"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
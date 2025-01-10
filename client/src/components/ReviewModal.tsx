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
        
        <h2 className="text-2xl font-bold mb-6 text-white">Add Review</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-lg font-medium text-white">Price Accuracy Rating</label>
            <div className="flex space-x-6">
              {[
                { value: 'accurate', label: 'Accurate' },
                { value: 'high', label: 'Too High' },
                { value: 'low', label: 'Too Low' }
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center text-white group cursor-pointer">
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      name="priceAccuracy"
                      value={value}
                      checked={priceAccuracy === value}
                      onChange={(e) => setPriceAccuracy(e.target.value as PriceAccuracy)}
                      className="sr-only"
                    />
                    <div className={`
                      w-5 h-5 rounded-full border-2 transition-colors duration-200
                      ${priceAccuracy === value 
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-blue-400 hover:border-blue-300'
                      }
                    `}>
                      {priceAccuracy === value && (
                        <div className="w-2 h-2 bg-white rounded-full absolute 
                          top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                  <span className="ml-3 group-hover:text-gray-300 transition-colors duration-200">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-lg font-medium text-white">Rating</label>
            <div className="flex space-x-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors duration-200 hover:scale-110 transform ${
                    star <= rating ? 'text-blue-500' : 'text-gray-300'
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
              className="w-full p-3 border border-blue-400 rounded-lg bg-gray-800 text-white 
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
                border border-transparent hover:border-blue-400 rounded-lg"
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
import { CustomProperty } from '../types/Property';
import { useAuth } from '../contexts/AuthContext';
import { submitVote } from '../utils/submitVote';
import { ReactElement, useState } from 'react';
import { CheckCircle, X, XCircle } from 'lucide-react';
import { deleteVote } from '../utils/deleteVote';

interface PropertyPopupProps {
  property: CustomProperty;
  onClose: () => void;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  TIMEOUT: number;
  showNotification: (message: string, type: 'success' | 'error' | 'warning', icon: ReactElement) => void;
}

type VoteType = "higher" | "equal" | "lower"

const PropertyPopup = ({ 
  property, 
  onClose, 
  setIsLoginModalOpen,
  showNotification,
  TIMEOUT
}: PropertyPopupProps) => {
  const { isLoggedIn, user } = useAuth();

  const userId = user?.id

  console.log(user)
  const votes = property.votes ? JSON.parse(property.votes) : [];
  const didUserVote = votes.some(vote => vote.userId === userId);

  console.log(votes)
  // Get the user's vote type if they voted
  const userVote = votes.find(vote => vote.userId === userId)?.voteType;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVoteClick = async (voteType: VoteType) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await submitVote(property.id, voteType);
      
      if (response.success) {
        showNotification('Vote submitted successfully!', 'success', <CheckCircle />);
        return;
      }
      
      if (response.alreadyVotedError) {
        showNotification('You have already voted for this property', 'warning', <XCircle />);
        return;
      }
  
      showNotification('Failed to submit vote. Please try again.', 'error', <XCircle />);
    } catch (error) {
      console.error(error);
      showNotification('Failed to submit vote. Please try again.', 'error', <XCircle />);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, TIMEOUT);
    }
  };

  const handleDeleteVote = async () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await deleteVote(property.id);
      
      if (response.success) {
        showNotification('Vote removed successfully!', 'success', <CheckCircle />);
        return;
      }
  
      showNotification('Failed to remove vote. Please try again.', 'error', <XCircle />);
    } catch (error) {
      console.error(error);
      showNotification('Failed to remove vote. Please try again.', 'error', <XCircle />);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, TIMEOUT);
    }
  };

  return (
    <div className="overflow-hidden bg-white w-full max-w-lg rounded-lg">
      <div className="relative px-5 py-3 bg-accent text-white">
        <button
          className="absolute top-2 right-2 p-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-gray-700 hover:bg-white transition-all duration-200"
          onClick={onClose}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
  
        <div className="flex items-center gap-5">
          <div className='flex items-baseline gap-2'>
            <h2 className="text-base sm:text-xl font-bold">{property.price} €</h2>
            <p className="text-xs sm:text-sm text-gray-300">{property.pricePerSquareMeter.toFixed(0)} €/m²</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-mainWhite text-surface-hover`}>
            For {property.status}
          </span>
        </div>
      </div>
  
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="p-2 border border-surface-border/50 rounded">
            <p className="text-[10px] sm:text-xs text-gray-500">Type</p>
            <p className="text-xs sm:text-sm font-medium text-gray-900">
              {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
            </p>
          </div>
          <div className="p-2 border border-surface-border/50 rounded">
            <p className="text-[10px] sm:text-xs text-gray-500">Size</p>
            <p className="text-xs sm:text-sm font-medium text-gray-900">{property.size}m²</p>
          </div>
          <div className="p-2 border border-surface-border/50 rounded">
            <p className="text-[10px] sm:text-xs text-gray-500">Rooms</p>
            <p className="text-xs sm:text-sm font-medium text-gray-900">{property.rooms}</p>
          </div>
          <div className="p-2 border border-surface-border/50 rounded">
            <p className="text-[10px] sm:text-xs text-gray-500">Floor</p>
            <p className="text-xs sm:text-sm font-medium text-gray-900">2/3</p>
          </div>
        </div>
  
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-[10px] sm:text-xs font-medium text-gray-700">Data Reliability</p>
              <span className="text-[10px] sm:text-xs text-gray-500">{property.numberOfReviews} reviews</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${property.dataReliability}%` }}
              />
            </div>
            
          </div>
  
          <div className="space-y-1 flex flex-col justify-end">
            <div className="flex justify-between items-center mb-1">
              <div className="tooltip">
                <button className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                  Help
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M12 21a9 9 0 110-18 9 9 0 010 18z" />
                  </svg>
                </button>
                <span className="tooltip-text text-[10px] sm:text-xs">
                  Help us improve price accuracy by voting:
                  <br />• Lower - if the price seems too high
                  <br />• OK - if the price seems accurate
                  <br />• Higher - if the price seems too low
                </span>
              </div>
            </div>
  
            <div className="flex gap-1">
              <button
                disabled={isSubmitting}
                onClick={() => handleVoteClick("lower")}
                className="flex-1 flex items-center justify-center gap-1 p-1.5 bg-white border border-red-200 text-red-600 rounded
                        hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-[10px] sm:text-xs font-medium
                        disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                Lower
              </button>
  
              <button
                disabled={isSubmitting}
                onClick={() => handleVoteClick("equal")}
                className="flex-1 flex items-center justify-center gap-1 p-1.5 bg-white border border-green-200 text-green-600 rounded
                  hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-[10px] sm:text-xs font-medium
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                OK
              </button>
  
              <button              
                disabled={isSubmitting}
                onClick={() => handleVoteClick("higher")}
                className="flex-1 flex items-center justify-center gap-1 p-1.5 bg-white border border-blue-200 text-blue-600 rounded
                        hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-[10px] sm:text-xs font-medium
                        disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
                Higher
              </button>
            </div>
          </div>
        </div>
  
        <div className='flex items-end justify-between w-full'>
          <p className="text-[10px] sm:text-xs text-gray-400 text-right">
            Last review: {new Date(property.updatedAt).toLocaleDateString('en-US')}
          </p>
          {didUserVote && <div className="p-2 rounded space-y-3 flex flex-col items-center">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Your vote:</p>
              <p className="text-xs font-medium text-gray-900">
                You voted that this price seems:
                <span className='font-medium text-red-500 ml-1'>Lower</span>
              </p>
            </div>
            <button 
              onClick={() => handleDeleteVote()}
              className="text-xs px-3 py-1.5 border border-gray-200 
              rounded text-surface hover:bg-gray-50 hover:text-surface-hover 
              hover:border-surface-border transition-all duration-200 flex items-center gap-1
              "
            >
              <X size={15}/>
              Remove my vote
            </button>
          </div>}
        </div>
      </div>
    </div>
  );
};

export default PropertyPopup;
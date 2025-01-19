import React, { Dispatch, SetStateAction } from 'react';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthButtonProps {
  setIsLoginModalOpen: Dispatch<SetStateAction<boolean>>
}

const AuthButton: React.FC<AuthButtonProps> = ({ 
    setIsLoginModalOpen 
}) => {

  const { user, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div 
        className="w-10 h-10 rounded-full bg-gray-300 animate-pulse border-2 border-gray-200 shadow-lg" 
        aria-label="Loading profile"
      />
    );
  }

  if (isLoggedIn && user) {
    return (
      <img 
        src={user.image} 
        alt="Profile" 
        className="w-10 h-10 rounded-full object-cover border-2 border-mainWhite shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
      />
    );
  }

  return (
    <button
      onClick={() => setIsLoginModalOpen(true)}
      className="flex items-center gap-2 bg-mainWhite px-4 py-2 rounded-lg text-black shadow-lg hover:bg-mainWhite-muted transition-colors duration-200"
    >
      <UserCircle2 className="w-5 h-5" />
      <span className="font-medium">Sign In</span>
    </button>
  );
};

export default AuthButton;

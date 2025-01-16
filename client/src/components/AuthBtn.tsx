import React, { Dispatch, SetStateAction } from 'react';
import { UserCircle2 } from 'lucide-react';

interface AuthButtonProps {
  isLoggedIn: boolean;
  profileImage?: string;
  setIsLoginModalOpen: Dispatch<SetStateAction<boolean>>
}

const AuthButton: React.FC<AuthButtonProps> = ({ 
    isLoggedIn, profileImage, setIsLoginModalOpen 
}) => {
  if (isLoggedIn && profileImage) {
    return (
      <img 
        src={profileImage} 
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
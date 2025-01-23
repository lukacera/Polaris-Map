import React, { Dispatch, SetStateAction, useState } from 'react';
import { UserCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PopupModal from './UI/PopupModal';
import DefImg from "/DefProfImg.webp"

interface AuthButtonProps {
  setIsLoginModalOpen: Dispatch<SetStateAction<boolean>>
}

const AuthButton: React.FC<AuthButtonProps> = ({ setIsLoginModalOpen }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user, isLoggedIn, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div 
        className="w-10 h-10 rounded-full bg-gray-300 animate-pulse border-2 border-200 shadow-lg" 
        aria-label="Loading profile"
      />
    );
  }

  if (isLoggedIn && user) {
    return (
      <>
        <img 
          src={imgError ? DefImg : user.image} 
          alt="Profile" 
          onError={() => setImgError(true)}
          onClick={() => setShowLogoutConfirm(true)}
          className="w-10 h-10 rounded-full object-cover border-2 border-mainWhite shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
        />

        <PopupModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          title="Confirm Logout"
          description="Are you sure that you want to log out?"
          icon={<LogOut className="w-5 h-5 text-red-400" />}
          primaryButton={{
            label: "Yes, logout",
            onClick: handleLogout,
            className: "flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-medium"
          }}
          secondaryButton={{
            label: "Cancel",
            onClick: () => setShowLogoutConfirm(false)
          }}
        />
      </>
    );
  }

  return (
    <button
      onClick={() => setIsLoginModalOpen(true)}
      className="flex items-center gap-2 bg-mainWhite 
      px-4 py-2 rounded-lg text-black shadow-lg hover:bg-mainWhite-muted 
      transition-colors duration-200"
    >
      <UserCircle2 className="w-5 h-5" />
      <span className="font-medium">Sign In</span>
    </button>
  );
};

export default AuthButton;
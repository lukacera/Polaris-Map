import React, { Dispatch, SetStateAction, useState, useCallback, useEffect } from 'react';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthButtonProps {
  setIsLoginModalOpen: Dispatch<SetStateAction<boolean>>
}

const AuthButton: React.FC<AuthButtonProps> = ({ 
    setIsLoginModalOpen 
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isLoggedIn, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowLogoutConfirm(false);
    }
  }, []);

  useEffect(() => {
    if (showLogoutConfirm) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [showLogoutConfirm, handleEscapeKey]);

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
          src={user.image} 
          alt="Profile" 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-10 h-10 rounded-full object-cover border-2 border-mainWhite shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
        />

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex 
          items-center justify-center z-50">
            <div 
              className="bg-background p-6 rounded-lg max-w-sm w-full 
              mx-4 "
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-6">
                Are you sure that you want to log out?
              </h2>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-background-lighter text-white hover:bg-background border border-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Yes, logout
                </button>
              </div>
            </div>
          </div>
        )}
      </>
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
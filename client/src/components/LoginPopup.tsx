import { X, LogIn } from 'lucide-react';

interface LoginRequiredPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: () => void;
}

export default function LoginPopup({ 
    isOpen, 
    onClose, 
    onLogin = () => (window.location.href = '/login') 
}: LoginRequiredPopupProps) {
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-black/60 
        flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <div className="bg-background text-white rounded-2xl p-6 w-full max-w-md mx-4 relative shadow-2xl border border-surface-border">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors duration-200 
              hover:bg-surface-border/10 p-2 rounded-full"
          type="button"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LogIn className="w-5 h-5 text-blue-400" />
            Log In to Continue
          </h2>
          <p className="text-gray-400 mt-2">
            Sign in to unlock this action. 
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-gray-300 hover:text-white transition-colors duration-200
                border border-surface-border hover:border-surface-border/70 rounded-xl hover:bg-surface-border/10"
          >
            Cancel
          </button>
          <button
            onClick={onLogin}
            className="flex items-center justify-center px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl 
                transition-all duration-200 font-medium space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.8 0 7.2 1.5 9.8 3.8l7.4-7.4C37.7 2.4 31.2 0 24 0 14.6 0 6.4 5.6 2.4 13.6l8.7 6.8C13.2 14 18.2 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M48 24c0-1.7-.2-3.4-.5-5H24v9.5h13.8c-1 5.2-4.6 9.6-9.8 11.8l7.4 7.4C42.7 42.4 48 34 48 24z"
              />
              <path
                fill="#FBBC05"
                d="M10.8 27.8c-.9-2.6-.9-5.6 0-8.2L2.1 12.8c-3.3 6.6-3.3 14.8 0 21.4l8.7-6.4z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.5 0 12.4-2.2 16.8-5.9l-8.3-6.5c-2.6 1.7-5.8 2.6-8.9 2.6-5.8 0-10.8-3.6-12.6-8.7l-8.7 6.4c4 8 12.2 12.1 20.7 12.1z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}

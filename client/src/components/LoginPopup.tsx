import { LogIn } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import PopapModal from "./UI/PopupModal";

const LoginPopup = ({ onClose }: { onClose: () => void }) => {
  const { login } = useAuth();

  return (
    <PopapModal
      isOpen={true}
      onClose={onClose}
      title="Log In to Continue"
      description="Sign in to unlock this action."
      icon={<LogIn className="w-5 h-5 text-blue-400" />}
      primaryButton={{
        label: (
          <div className="flex items-center justify-center space-x-2">
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
          </div>
        ),
        onClick: login
      }}
      secondaryButton={{
        label: "Cancel",
        onClick: onClose
      }}
    />
  );
};

export default LoginPopup;
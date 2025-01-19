import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShouldRender(false);
    }, 2000);

    const unmountTimer = setTimeout(() => {
      onClose();
    }, 2200); // 2000ms + 200ms for animation

    return () => {
      clearTimeout(showTimer);
      clearTimeout(unmountTimer);
    };
  }, [onClose]);

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-200
        ${shouldRender ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Notification;
import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  const [progress, setProgress] = useState(100);
  const startTime = useRef(Date.now());
  const duration = 2000;

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 100 * (1 - elapsed / duration));
      
      setProgress(remaining);

      if (elapsed < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setTimeout(onClose, 200);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">{message}</span>
        </div>
        <div className="h-1 w-full bg-green-700/50 mt-2 rounded overflow-hidden">
          <div 
            className="h-full bg-white rounded"
            style={{ width: `${progress}%`, transition: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Notification;
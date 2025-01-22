import React, { useEffect, useState, useRef, ReactElement, cloneElement } from 'react';

interface NotificationProps {
  notification: { 
    message: string; 
    isVisible: boolean; 
    color: string;
    icon: ReactElement;
  };
  onClose: () => void;
  timeout?: number;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose, timeout }) => {
  const [progress, setProgress] = useState(100);
  const startTime = useRef(Date.now());
  const duration = timeout ?? 1000;

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
  }, [onClose, duration]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 
    animate-fade-in w-full max-w-[25rem] mx-auto px-4 text-center">
      <div className={`${notification.color ?? "bg-green-600"} text-white px-4 py-2 rounded-lg shadow-lg`}>
        <div className="flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden">
          {cloneElement(notification.icon, { 
            className: "w-5 h-5 flex-shrink-0" 
          })}
          <span className="font-medium truncate">{notification.message}</span>
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
import React from 'react';
import { Plus } from 'lucide-react';

interface NewPropBtnProps {
  onClick: () => void;
  isDisabled?: boolean;
  className?: string;
}

const getButtonStyles = (isDisabled: boolean): string => {
  const baseStyles = `
    px-4 py-2 
    bg-accent text-white 
    shadow-lg rounded-lg 
    transition-all duration-200 
    flex items-center space-x-2 
    font-medium
  `;

  if (isDisabled) {
    return `${baseStyles} opacity-50 cursor-not-allowed`;
  }

  return `${baseStyles} hover:bg-accent-hover`;
};

const NewPropBtn: React.FC<NewPropBtnProps> = ({
  onClick,
  isDisabled = false,
  className = ''
}) => {
  const handleClick = () => {
    if (isDisabled) return;
    
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`${getButtonStyles(isDisabled)} ${className}`}
      title={isDisabled ? 'Not available' : 'Add new property'}
    >
      <Plus className="w-5 h-5" />
      <span>Add new property</span>
    </button>
  );
};

export default NewPropBtn;
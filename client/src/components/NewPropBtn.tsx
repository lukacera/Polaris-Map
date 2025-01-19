import React, { Dispatch, SetStateAction } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NewPropBtnProps {
  setIsAddPropModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsLoginModalOpen: Dispatch<SetStateAction<boolean>>;
}

const NewPropBtn: React.FC<NewPropBtnProps> = ({
  setIsLoginModalOpen,
  setIsAddPropModalOpen
}) => {
  const { isLoggedIn } = useAuth();

  const handleClick = () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsAddPropModalOpen(true)
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-accent text-white shadow-lg rounded-lg 
      transition-all duration-200 flex items-center space-x-2 font-medium 
      hover:bg-accent-hover"
      title="Add new property"
    >
      <Plus className="w-5 h-5" />
      <span>Add new property</span>
    </button>
  );
};

export default NewPropBtn;
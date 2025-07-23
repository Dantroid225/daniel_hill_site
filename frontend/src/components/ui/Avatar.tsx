import React from 'react';
import { motion } from 'framer-motion';
import dhPic from '@/assets/dh_pic.png';

interface AvatarProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showBorder?: boolean;
  animated?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 'medium',
  className = '',
  showBorder = true,
  animated = true,
}) => {
  const sizeClasses = {
    small: 'w-20 h-20 md:w-24 md:h-24',
    medium: 'w-28 h-28 md:w-36 md:h-36',
    large: 'w-36 h-36 md:w-52 md:h-52 lg:w-72 lg:h-72',
  };

  const borderClasses = showBorder ? 'ring-4 ring-primary/20 shadow-lg' : '';

  const imageElement = (
    <img
      src={dhPic}
      alt='Daniel Hill - Software Application Engineer'
      className={`rounded-full object-cover ${sizeClasses[size]} ${borderClasses} ${className}`}
    />
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        className='inline-block'
      >
        {imageElement}
      </motion.div>
    );
  }

  return <div className='inline-block'>{imageElement}</div>;
};

export default Avatar;

import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '@/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, hover = true }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5 } : {}}
      className={classNames(
        'bg-card text-card-foreground rounded-lg border border-border shadow-sm',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default Card; 
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

import AnimatedBackground from '@/components/ui/AnimatedBackground';
import Avatar from '@/components/ui/Avatar';

const Hero: React.FC = () => {
  return (
    <section className='min-h-screen flex items-center justify-center relative overflow-hidden pt-20'>
      {/* Background gradient */}
      <div className='absolute inset-0 gradient-primary opacity-10' />

      {/* Animated background elements */}
      <AnimatedBackground />

      {/* Content */}
      <div className='container mx-auto px-4 text-center relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className='mb-8'>
            <Avatar size='large' className='mb-6' />
          </div>
          <h1 className='text-5xl md:text-7xl font-bold mb-6'>
            Hi, I'm <span className='gradient-text'>Daniel Hill</span>
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
            Full-stack web developer passionate about creating beautiful,
            functional, and user-friendly applications.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              to={ROUTES.PROJECTS}
              className='btn btn-primary px-8 py-3 text-lg'
            >
              View My Work
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className='btn btn-outline px-8 py-3 text-lg'
            >
              Get In Touch
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

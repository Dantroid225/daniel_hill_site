import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants';
import ThemeToggle from '@/components/ui/ThemeToggle';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.ABOUT, label: 'About' },
    { path: ROUTES.PROJECTS, label: 'Projects' },
    { path: ROUTES.CONTACT, label: 'Contact' },
    { path: ROUTES.BLOG, label: 'Blog' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
    >
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <Link to={ROUTES.HOME} className='text-2xl font-bold gradient-text'>
            DH
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-8'>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-primary font-semibold'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='md:hidden p-2'
          >
            <span className='sr-only'>Open menu</span>
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden mt-4 pb-4'
          >
            <div className='flex flex-col space-y-4'>
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'text-primary font-semibold'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};

export default Header;

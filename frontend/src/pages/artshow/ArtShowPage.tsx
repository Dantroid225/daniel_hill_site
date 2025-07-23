import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import testHallImage from '@/assets/test_hall.png';

const ArtShowPage: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<
    'left' | 'right' | null
  >(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollInterval: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Handle drag scrolling
        const deltaX = e.clientX - dragStartX;
        container.scrollLeft = dragStartScrollLeft - deltaX;
        return;
      }

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const containerWidth = rect.width;

      // Define edge zones (20% of container width on each side)
      const edgeZone = containerWidth * 0.2;

      if (mouseX < edgeZone) {
        // Mouse in left edge zone - scroll left
        setScrollDirection('left');
        setIsScrolling(true);
      } else if (mouseX > containerWidth - edgeZone) {
        // Mouse in right edge zone - scroll right
        setScrollDirection('right');
        setIsScrolling(true);
      } else {
        // Mouse in center - stop scrolling
        setIsScrolling(false);
        setScrollDirection(null);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setDragStartX(e.clientX);
      setDragStartScrollLeft(container.scrollLeft);
      container.style.cursor = 'grabbing';
      container.style.scrollBehavior = 'auto'; // Disable smooth scrolling during drag
      setIsScrolling(false); // Stop auto-scroll when dragging
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      container.style.cursor = 'grab';
      container.style.scrollBehavior = 'smooth'; // Re-enable smooth scrolling
    };

    const handleMouseLeave = () => {
      setIsScrolling(false);
      setScrollDirection(null);
      setIsDragging(false);
      container.style.cursor = 'grab';
      container.style.scrollBehavior = 'smooth'; // Re-enable smooth scrolling
    };

    // Touch event handlers for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        // Handle drag scrolling for touch
        const deltaX = e.touches[0].clientX - dragStartX;
        container.scrollLeft = dragStartScrollLeft - deltaX;
        return;
      }

      e.preventDefault(); // Prevent default touch scrolling
      const rect = container.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const containerWidth = rect.width;

      // Define edge zones (20% of container width on each side)
      const edgeZone = containerWidth * 0.2;

      if (touchX < edgeZone) {
        // Touch in left edge zone - scroll left
        setScrollDirection('left');
        setIsScrolling(true);
      } else if (touchX > containerWidth - edgeZone) {
        // Touch in right edge zone - scroll right
        setScrollDirection('right');
        setIsScrolling(true);
      } else {
        // Touch in center - stop scrolling
        setIsScrolling(false);
        setScrollDirection(null);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      setIsDragging(true);
      setDragStartX(e.touches[0].clientX);
      setDragStartScrollLeft(container.scrollLeft);
      container.style.scrollBehavior = 'auto'; // Disable smooth scrolling during drag
      setIsScrolling(false); // Stop auto-scroll when dragging
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      container.style.scrollBehavior = 'smooth'; // Re-enable smooth scrolling
      setIsScrolling(false);
      setScrollDirection(null);
    };

    // Auto-scroll function (faster)
    const autoScroll = () => {
      if (!isScrolling || !scrollDirection || isDragging) return;

      const scrollAmount = scrollDirection === 'left' ? -15 : 15; // Increased from 5 to 15
      container.scrollLeft += scrollAmount;
    };

    // Start auto-scroll interval when scrolling is active
    if (isScrolling) {
      scrollInterval = setInterval(autoScroll, 16); // ~60fps
    }

    // Desktop event listeners
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Mobile event listeners
    container.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    container.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      // Clean up desktop event listeners
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);

      // Clean up mobile event listeners
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);

      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
    };
  }, [
    isScrolling,
    scrollDirection,
    isDragging,
    dragStartX,
    dragStartScrollLeft,
  ]);

  return (
    <div className='min-h-screen pt-20'>
      {/* Header Section */}
      <div className='container mx-auto px-4 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-4xl md:text-5xl font-bold mb-8 text-center'>
            The <span className='gradient-text'>Art Show</span>
          </h1>
          <p className='text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto'>
            Welcome to my digital art gallery. Each piece represents a unique
            creative journey and artistic expression.
          </p>
        </motion.div>
      </div>

      {/* Museum Hallway Section - Horizontal Scrolling with Background */}
      <div className='w-full bg-gradient-to-b from-background to-secondary/10'>
        <div className='relative overflow-hidden'>
          {/* Inset effect - top shadow */}
          <div className='absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/10 to-transparent z-10'></div>

          {/* Inset effect - bottom shadow */}
          <div className='absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent z-10'></div>

          {/* Horizontal Scrolling Container */}
          <div className='relative py-20'>
            <div
              ref={scrollContainerRef}
              className='overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing touch-pan-x select-none'
              style={{ scrollBehavior: 'smooth' }}
            >
              <div
                className='min-w-max'
                style={{
                  backgroundImage: `url(${testHallImage})`,
                  backgroundRepeat: 'repeat-x',
                  backgroundSize: 'auto 100%',
                  backgroundPosition: 'center',
                  width: '300%', // Make it wider than the page
                  height: '800px', // Much taller for art images
                }}
              >
                {/* Content can be added here if needed */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className='container mx-auto px-4 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='text-center'
        >
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Each piece in this gallery represents a moment of creative
            exploration and artistic expression. The digital canvas allows for
            endless possibilities and innovative techniques.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ArtShowPage;

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import frameImage from '@/assets/frame_test.png';

interface ArtCard {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  imageUrl?: string;
  aspectRatio: number;
}

const ArtShowPage: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<
    'left' | 'right' | null
  >(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState(0);
  const [artCards, setArtCards] = useState<ArtCard[]>([]);
  const [lastCardX, setLastCardX] = useState(100); // Starting position
  const [containerHeight, setContainerHeight] = useState(800);

  // Sample art project images for testing
  const sampleArtImages = [
    '/uploads/images/image-1753244077780-587641624_optimized.jpg',
    // Add more sample images here
  ];

  // Generate a new art card with random positioning and proportional sizing
  const generateArtCard = useCallback(() => {
    // Random aspect ratio for art projects (portrait, landscape, square)
    const aspectRatios = [0.75, 1, 1.33, 1.5, 1.77]; // Common art aspect ratios
    const aspectRatio =
      aspectRatios[Math.floor(Math.random() * aspectRatios.length)];

    // Base size constraints
    const maxWidth = 400;
    const maxHeight = 500;
    const minWidth = 200;
    const minHeight = 150;

    // Calculate dimensions based on aspect ratio within constraints
    let cardWidth, cardHeight;

    if (aspectRatio >= 1) {
      // Landscape or square - width is the limiting factor
      cardWidth = Math.random() * (maxWidth - minWidth) + minWidth;
      cardHeight = cardWidth / aspectRatio;
      if (cardHeight > maxHeight) {
        cardHeight = maxHeight;
        cardWidth = cardHeight * aspectRatio;
      }
    } else {
      // Portrait - height is the limiting factor
      cardHeight = Math.random() * (maxHeight - minHeight) + minHeight;
      cardWidth = cardHeight * aspectRatio;
      if (cardWidth > maxWidth) {
        cardWidth = maxWidth;
        cardHeight = cardWidth / aspectRatio;
      }
    }

    // Ensure minimum spacing between cards (50% more spacing)
    const minSpacing = 150; // Increased from 100
    const maxSpacing = 450; // Increased from 300
    const spacing = Math.random() * (maxSpacing - minSpacing) + minSpacing;

    // Ensure the new card doesn't overlap with the previous card
    const newX = lastCardX + spacing;

    // Random vertical position, ensuring the entire card is above the bottom 25% of container height
    const minY = containerHeight * 0.02; // Start from 2% of height (closer to ceiling)
    const maxY = containerHeight * 0.75 - cardHeight; // Ensure entire card fits above bottom 25%
    const newY = Math.max(minY, Math.random() * (maxY - minY) + minY);

    // Random opacity for variety
    const opacity = Math.random() * 0.3 + 0.7; // 0.7-1.0 opacity

    // Random art image (for testing)
    const imageUrl =
      sampleArtImages[Math.floor(Math.random() * sampleArtImages.length)];

    const newCard: ArtCard = {
      id: Date.now() + Math.random(),
      x: newX,
      y: newY,
      width: cardWidth,
      height: cardHeight,
      opacity: opacity,
      imageUrl: imageUrl,
      aspectRatio: aspectRatio,
    };

    // Update lastCardX to the end position of this card (x + width)
    setLastCardX(newX + cardWidth);
    return newCard;
  }, [lastCardX, containerHeight]);

  // Check if a new card should be generated based on scroll position
  const checkAndGenerateCard = useCallback(
    (scrollLeft: number) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const scrollRight = scrollLeft + containerRect.width;

      // Generate a new card if we're approaching the end of existing cards
      if (scrollRight > lastCardX - 300) {
        const newCard = generateArtCard();
        setArtCards(prev => [...prev, newCard]);
      }
    },
    [generateArtCard, lastCardX]
  );

  // Initialize container dimensions and first few cards
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setContainerHeight(800); // Fixed height for the art gallery
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Generate initial art cards
    const initialCards: ArtCard[] = [];
    let currentX = 100;

    for (let i = 0; i < 5; i++) {
      // Random aspect ratio for art projects
      const aspectRatios = [0.75, 1, 1.33, 1.5, 1.77];
      const aspectRatio =
        aspectRatios[Math.floor(Math.random() * aspectRatios.length)];

      // Calculate dimensions based on aspect ratio
      const maxWidth = 400;
      const maxHeight = 500;
      const minWidth = 200;
      const minHeight = 150;

      let cardWidth, cardHeight;

      if (aspectRatio >= 1) {
        cardWidth = Math.random() * (maxWidth - minWidth) + minWidth;
        cardHeight = cardWidth / aspectRatio;
        if (cardHeight > maxHeight) {
          cardHeight = maxHeight;
          cardWidth = cardHeight * aspectRatio;
        }
      } else {
        cardHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        cardWidth = cardHeight * aspectRatio;
        if (cardWidth > maxWidth) {
          cardWidth = maxWidth;
          cardHeight = cardWidth / aspectRatio;
        }
      }

      const spacing = Math.random() * 300 + 150; // 150-450px spacing (50% more)

      const newX = currentX + spacing;
      const minY = 800 * 0.02; // Start from 2% of height (closer to ceiling)
      const maxY = 800 * 0.75 - cardHeight; // Ensure entire card fits above bottom 25%
      const newY = Math.max(minY, Math.random() * (maxY - minY) + minY);

      // Random art image (for testing)
      const imageUrl =
        sampleArtImages[Math.floor(Math.random() * sampleArtImages.length)];

      initialCards.push({
        id: Date.now() + Math.random() + i,
        x: newX,
        y: newY,
        width: cardWidth,
        height: cardHeight,
        opacity: Math.random() * 0.3 + 0.7,
        imageUrl: imageUrl,
        aspectRatio: aspectRatio,
      });

      currentX = newX + cardWidth; // Update to the end position of this card
    }

    setArtCards(initialCards);
    setLastCardX(currentX);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Monitor scroll position and generate new cards
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      checkAndGenerateCard(scrollLeft);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [checkAndGenerateCard]);

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
      <div className='w-full bg-white'>
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
                className='relative min-w-max'
                style={{
                  width: '300%', // Make it wider than the page
                  height: '800px', // Much taller for art images
                }}
              >
                {/* Dynamic Art Cards with Frames */}
                {artCards.map(card => (
                  <motion.div
                    key={card.id}
                    className='absolute'
                    style={{
                      left: `${card.x}px`,
                      top: `${card.y}px`,
                      width: `${card.width}px`,
                      height: `${card.height}px`,
                      opacity: card.opacity,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: card.opacity, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    {/* Frame Background */}
                    <div
                      className='w-full h-full bg-cover bg-center'
                      style={{
                        backgroundImage: `url(${frameImage})`,
                        backgroundSize: '100% 100%',
                      }}
                    />

                    {/* Art Image Overlay (positioned in the red area of the frame) */}
                    {card.imageUrl && (
                      <div
                        className='absolute inset-0 bg-cover bg-center'
                        style={{
                          backgroundImage: `url(${card.imageUrl})`,
                          // Position the image in the center area (red area of frame)
                          top: '15%',
                          left: '15%',
                          right: '15%',
                          bottom: '15%',
                        }}
                      />
                    )}
                  </motion.div>
                ))}
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

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { portfolioApi } from '@/services/api';

interface ArtProject {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ArtCard {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  imageUrl?: string;
  aspectRatio: number;
  projectId?: number;
  title?: string;
  isLoading?: boolean;
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
  const [containerHeight, setContainerHeight] = useState(800);

  // Art project data management
  const [artProjects, setArtProjects] = useState<ArtProject[]>([]);
  const [isLoadingArtData, setIsLoadingArtData] = useState(false);
  const [artDataLoaded, setArtDataLoaded] = useState(false);

  // Batch generation management
  const [visibleCards, setVisibleCards] = useState<ArtCard[]>([]);
  const [allGeneratedCards, setAllGeneratedCards] = useState<ArtCard[]>([]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [lastGeneratedX, setLastGeneratedX] = useState(100);
  const hasGeneratedInitialBatchRef = useRef(false);
  const lastGenerationTimeRef = useRef(0);
  const hasUpdatedInitialCardsRef = useRef(false);

  // Load art projects data (non-blocking)
  const loadArtProjects = useCallback(async () => {
    if (isLoadingArtData || artDataLoaded) return;

    console.log('🔄 Starting to load art projects...');
    console.log(
      '🌐 API Base URL:',
      import.meta.env.VITE_API_URL || 'http://localhost:5000'
    );
    setIsLoadingArtData(true);
    try {
      const projects = await portfolioApi.getProjectsByCategory('art');
      console.log('✅ Art projects loaded successfully:', projects);
      console.log('📊 Number of projects:', projects.length);
      if (projects.length > 0) {
        console.log('🖼️  First project image URL:', projects[0].imageUrl);
        console.log('🖼️  First project title:', projects[0].title);
      }
      setArtProjects(projects);
      setArtDataLoaded(true);
    } catch (error) {
      console.error('❌ Failed to load art projects:', error);
      // Don't throw - allow cards to continue with placeholder images
    } finally {
      setIsLoadingArtData(false);
    }
  }, [isLoadingArtData, artDataLoaded]);

  // Get image dimensions asynchronously
  const getImageDimensions = useCallback(
    (imageUrl: string): Promise<{ width: number; height: number }> => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
          // Fallback to default aspect ratio if image fails to load
          resolve({ width: 400, height: 300 });
        };
        img.src = imageUrl;
      });
    },
    []
  );

  // Get a random art project (with fallback)
  const getRandomArtProject = useCallback((): ArtProject | null => {
    if (artProjects.length === 0) return null;
    const project = artProjects[Math.floor(Math.random() * artProjects.length)];

    // If the project has no image, use a fallback image
    if (!project.imageUrl || project.imageUrl === '') {
      console.log('⚠️  Project has no image, using fallback:', project.title);
      return {
        ...project,
        imageUrl:
          'http://localhost:5000/uploads/images/image-1753244077780-587641624_optimized.jpg',
      };
    }

    return project;
  }, [artProjects]);

  // Generate a batch of cards (5-8 cards at a time)
  const generateCardBatch = useCallback(() => {
    if (isGeneratingBatch) {
      console.log('🚫 Batch generation already in progress, skipping...');
      return;
    }

    console.log('🎯 Starting batch generation...');
    console.log('📍 Current lastGeneratedX:', lastGeneratedX);
    console.log('📊 Total cards before batch:', allGeneratedCards.length);
    console.log(
      '🏁 Has generated initial batch:',
      hasGeneratedInitialBatchRef.current
    );

    setIsGeneratingBatch(true);
    const batchSize = Math.floor(Math.random() * 4) + 5; // 5-8 cards
    const newCards: ArtCard[] = [];
    let currentX = lastGeneratedX;

    // For the first batch, start with some spacing from the left edge
    if (allGeneratedCards.length === 0) {
      currentX = 200; // Start 200px from the left edge
      console.log('🎨 First batch - starting at x=200');
    }

    // Safety check: if currentX is unreasonably large, reset it more conservatively
    if (currentX > 5000) {
      // Reduced from 10000 to 5000
      console.warn(
        '⚠️ Position reset: currentX was too large, resetting to 200'
      );
      currentX = 200;
    }

    for (let i = 0; i < batchSize; i++) {
      // Use placeholder dimensions initially - will be updated when art data is loaded
      const placeholderAspectRatio = 1.33; // Default aspect ratio
      const maxWidth = 400;
      const maxHeight = 500;
      const minWidth = 200;

      let cardWidth, cardHeight;

      // Use placeholder dimensions that will be updated later
      cardWidth = Math.random() * (maxWidth - minWidth) + minWidth;
      cardHeight = cardWidth / placeholderAspectRatio;
      if (cardHeight > maxHeight) {
        cardHeight = maxHeight;
        cardWidth = cardHeight * placeholderAspectRatio;
      }

      // Ensure proper spacing between cards (150-450px spacing)
      const spacing = Math.random() * 300 + 150;
      const newX = currentX + spacing;

      // Check if this position would overlap with any existing cards (not cards in this batch)
      const wouldOverlap = allGeneratedCards.some(existingCard => {
        const existingEnd = existingCard.x + existingCard.width;
        const newEnd = newX + cardWidth;
        return !(newEnd < existingCard.x || newX > existingEnd);
      });

      if (wouldOverlap) {
        console.warn(
          `⚠️ Card ${
            i + 1
          } would overlap with existing card at x=${newX}, moving further right...`
        );
        // Move the card further to the right to avoid overlap
        currentX = newX + cardWidth + 100; // Add extra spacing
        continue;
      }

      const minY = containerHeight * 0.02;
      const maxY = containerHeight * 0.75 - cardHeight;
      const newY = Math.max(minY, Math.random() * (maxY - minY) + minY);

      const cardId = Date.now() + Math.random() + i;
      const newCard = {
        id: cardId,
        x: newX,
        y: newY,
        width: cardWidth,
        height: cardHeight,
        opacity: Math.random() * 0.3 + 0.7,
        aspectRatio: placeholderAspectRatio,
        isLoading: true,
      };

      newCards.push(newCard);

      // Update currentX to the end position of this card (x + width) for next iteration
      currentX = newX + cardWidth;
      console.log(
        `🎨 Card ${
          i + 1
        }: x=${newX}, width=${cardWidth}, end=${currentX}, spacing=${spacing}`
      );
    }

    console.log(
      `📦 Generated batch of ${batchSize} cards. Last card ends at: ${currentX}`
    );
    console.log(
      '🎨 New cards positions:',
      newCards.map(card => ({
        id: card.id,
        x: card.x,
        width: card.width,
        end: card.x + card.width,
      }))
    );

    setAllGeneratedCards(prev => {
      const updated = [...prev, ...newCards];
      console.log('📊 Total cards after batch:', updated.length);
      return updated;
    });
    setLastGeneratedX(currentX); // Set to the end position of the last card in this batch
    setIsGeneratingBatch(false);

    // Assign art data to new cards if available
    if (artDataLoaded && artProjects.length > 0) {
      setTimeout(async () => {
        setAllGeneratedCards(prevCards => {
          Promise.all(
            prevCards.map(async card => {
              if (
                card.isLoading &&
                newCards.some(newCard => newCard.id === card.id)
              ) {
                const project = getRandomArtProject();
                if (project) {
                  // Get actual image dimensions
                  const dimensions = await getImageDimensions(project.imageUrl);
                  const imageAspectRatio = dimensions.width / dimensions.height;

                  // Recalculate card dimensions based on actual image proportions
                  const maxWidth = 400;
                  const maxHeight = 500;
                  const minWidth = 200;
                  const minHeight = 150;

                  let cardWidth, cardHeight;

                  if (imageAspectRatio >= 1) {
                    // Landscape or square image
                    cardWidth =
                      Math.random() * (maxWidth - minWidth) + minWidth;
                    cardHeight = cardWidth / imageAspectRatio;
                    if (cardHeight > maxHeight) {
                      cardHeight = maxHeight;
                      cardWidth = cardHeight * imageAspectRatio;
                    }
                  } else {
                    // Portrait image
                    cardHeight =
                      Math.random() * (maxHeight - minHeight) + minHeight;
                    cardWidth = cardHeight * imageAspectRatio;
                    if (cardWidth > maxWidth) {
                      cardWidth = maxWidth;
                      cardHeight = cardWidth / imageAspectRatio;
                    }
                  }

                  console.log(
                    `🎨 Card ${card.id} - Image: ${dimensions.width}x${
                      dimensions.height
                    }, Aspect: ${imageAspectRatio.toFixed(
                      2
                    )}, Card: ${cardWidth.toFixed(0)}x${cardHeight.toFixed(0)}`
                  );

                  return {
                    ...card,
                    width: cardWidth,
                    height: cardHeight,
                    aspectRatio: imageAspectRatio,
                    imageUrl: project.imageUrl,
                    projectId: project.id,
                    title: project.title,
                    isLoading: false,
                  };
                }
              }
              return card;
            })
          ).then(updatedCards => {
            console.log('🎨 Updated cards with art data:', updatedCards.length);
            setAllGeneratedCards(updatedCards);
          });

          return prevCards; // Return current state while async operation is in progress
        });
      }, 0);
    }
  }, [
    isGeneratingBatch,
    lastGeneratedX,
    containerHeight,
    artDataLoaded,
    artProjects,
    getRandomArtProject,
    allGeneratedCards, // Added this dependency
  ]);

  // Calculate which cards should be visible based on scroll position
  const updateVisibleCards = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const currentScrollLeft = container.scrollLeft;
    const currentViewportWidth = rect.width;

    // Show cards that are within 2 viewport widths of the current scroll position
    const bufferWidth = currentViewportWidth * 2;
    const visibleStart = currentScrollLeft - bufferWidth;
    const visibleEnd = currentScrollLeft + currentViewportWidth + bufferWidth;

    const visible = allGeneratedCards.filter(
      card => card.x >= visibleStart && card.x <= visibleEnd
    );

    // More aggressive cleanup: remove cards that are more than 5 viewport widths behind (reduced from 10)
    const cleanupThreshold = currentScrollLeft - currentViewportWidth * 5;
    if (cleanupThreshold > 0) {
      const beforeCleanup = allGeneratedCards.length;
      setAllGeneratedCards(prev => {
        const filtered = prev.filter(card => card.x >= cleanupThreshold);
        if (filtered.length < beforeCleanup) {
          console.log(
            `🧹 Cleaned up ${beforeCleanup - filtered.length} old cards`
          );
        }
        return filtered;
      });
    }

    setVisibleCards(visible);
  }, [allGeneratedCards]);

  // Check if we need to generate more cards
  const checkAndGenerateMoreCards = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isGeneratingBatch) return;

    // Throttle card generation to prevent too frequent calls
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationTimeRef.current;
    if (timeSinceLastGeneration < 1000) {
      // Minimum 1 second between generations
      return;
    }

    const rect = container.getBoundingClientRect();
    const scrollRight = container.scrollLeft + rect.width;

    // Safety check: if lastGeneratedX is unreasonably large, reset it more conservatively
    if (lastGeneratedX > 5000) {
      // Reduced from 10000 to 5000
      console.warn(
        '⚠️ Position reset: lastGeneratedX was too large, resetting to current scroll position'
      );
      // Reset to current scroll position instead of a fixed value
      const newStartX = Math.max(200, container.scrollLeft + rect.width);
      setLastGeneratedX(newStartX);
      return;
    }

    // Generate more cards if we're approaching the end (within 2 viewport widths instead of 3)
    if (scrollRight > lastGeneratedX - rect.width * 2) {
      console.log('🚀 Triggering batch generation...');
      console.log('📍 Scroll position:', container.scrollLeft);
      console.log('📍 Scroll right edge:', scrollRight);
      console.log('📍 Last generated X:', lastGeneratedX);
      console.log('📍 Threshold:', lastGeneratedX - rect.width * 2);
      lastGenerationTimeRef.current = now; // Update last generation time
      generateCardBatch();
    }
  }, [lastGeneratedX, isGeneratingBatch, generateCardBatch]);

  // Initialize container dimensions and first batch of cards
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setContainerHeight(800); // Fixed height for the art gallery
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Generate initial batch of cards only once
    if (!hasGeneratedInitialBatchRef.current) {
      console.log('🎬 Initial batch generation triggered');
      generateCardBatch();
      hasGeneratedInitialBatchRef.current = true;
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [generateCardBatch]);

  // Load art data on component mount (non-blocking)
  useEffect(() => {
    loadArtProjects();
  }, [loadArtProjects]);

  // Update existing cards with art data when it becomes available
  useEffect(() => {
    if (
      artDataLoaded &&
      artProjects.length > 0 &&
      !hasUpdatedInitialCardsRef.current
    ) {
      console.log('🔄 Updating existing cards with art data...');

      // Small delay to ensure art data is fully processed
      setTimeout(async () => {
        const updatedCards = await Promise.all(
          allGeneratedCards.map(async card => {
            if (card.isLoading) {
              const project = getRandomArtProject();
              if (project) {
                console.log(
                  '🎨 Updating existing card',
                  card.id,
                  'with project:',
                  project.title
                );

                // Get actual image dimensions
                const dimensions = await getImageDimensions(project.imageUrl);
                const imageAspectRatio = dimensions.width / dimensions.height;

                // Recalculate card dimensions based on actual image proportions
                const maxWidth = 400;
                const maxHeight = 500;
                const minWidth = 200;
                const minHeight = 150;

                let cardWidth, cardHeight;

                if (imageAspectRatio >= 1) {
                  // Landscape or square image
                  cardWidth = Math.random() * (maxWidth - minWidth) + minWidth;
                  cardHeight = cardWidth / imageAspectRatio;
                  if (cardHeight > maxHeight) {
                    cardHeight = maxHeight;
                    cardWidth = cardHeight * imageAspectRatio;
                  }
                } else {
                  // Portrait image
                  cardHeight =
                    Math.random() * (maxHeight - minHeight) + minHeight;
                  cardWidth = cardHeight * imageAspectRatio;
                  if (cardWidth > maxWidth) {
                    cardWidth = maxWidth;
                    cardHeight = cardWidth / imageAspectRatio;
                  }
                }

                console.log(
                  `🎨 Existing Card ${card.id} - Image: ${dimensions.width}x${
                    dimensions.height
                  }, Aspect: ${imageAspectRatio.toFixed(
                    2
                  )}, Card: ${cardWidth.toFixed(0)}x${cardHeight.toFixed(0)}`
                );

                return {
                  ...card,
                  width: cardWidth,
                  height: cardHeight,
                  aspectRatio: imageAspectRatio,
                  imageUrl: project.imageUrl,
                  projectId: project.id,
                  title: project.title,
                  isLoading: false,
                };
              }
            }
            return card;
          })
        );

        const updatedCount = updatedCards.filter(
          card => !card.isLoading
        ).length;
        console.log(`✅ Updated ${updatedCount} cards with art data`);
        hasUpdatedInitialCardsRef.current = true; // Mark as updated
        setAllGeneratedCards(updatedCards);
      }, 100); // Small delay to ensure art data is ready
    }
  }, [
    artDataLoaded,
    artProjects,
    getRandomArtProject,
    getImageDimensions,
    allGeneratedCards,
  ]);

  // Monitor scroll position and generate new cards
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: number;

    const handleScroll = () => {
      // Throttle scroll events to reduce jumping
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        // Always update visible cards and check for more cards
        updateVisibleCards();
        checkAndGenerateMoreCards(); // Check for more cards to generate
      }, 32); // Increased to 32ms for smoother experience
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [checkAndGenerateMoreCards, updateVisibleCards]);

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
      setScrollDirection(null); // Clear scroll direction
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      container.style.cursor = 'grab';
      // Don't immediately re-enable smooth scrolling to prevent jumping
      setTimeout(() => {
        if (!isDragging) {
          container.style.scrollBehavior = 'smooth';
        }
      }, 100);
    };

    const handleMouseLeave = () => {
      setIsScrolling(false);
      setScrollDirection(null);
      setIsDragging(false);
      container.style.cursor = 'grab';
      // Don't immediately re-enable smooth scrolling to prevent jumping
      setTimeout(() => {
        if (!isDragging) {
          container.style.scrollBehavior = 'smooth';
        }
      }, 100);
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
      // Don't immediately re-enable smooth scrolling to prevent jumping
      setTimeout(() => {
        if (!isDragging) {
          container.style.scrollBehavior = 'smooth';
        }
      }, 100);
      setIsScrolling(false);
      setScrollDirection(null);
    };

    // Auto-scroll function (optimized)
    const autoScroll = () => {
      if (!isScrolling || !scrollDirection || isDragging) return;

      const scrollAmount = scrollDirection === 'left' ? -8 : 8; // Reduced for smoother scrolling
      container.scrollLeft += scrollAmount;
    };

    // Start auto-scroll interval when scrolling is active (reduced frequency)
    if (isScrolling) {
      scrollInterval = setInterval(autoScroll, 32); // ~30fps for smoother experience
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
                {/* Dynamic Art Cards with SVG Frame Masks */}
                {visibleCards.map(card => (
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
                    {/* SVG Frame with Art Image Mask */}
                    <svg
                      viewBox='0 0 400 300'
                      xmlns='http://www.w3.org/2000/svg'
                      preserveAspectRatio='none'
                      className='w-full h-full'
                    >
                      <defs>
                        <filter
                          id={`rough-${card.id}`}
                          x='-20%'
                          y='-20%'
                          width='140%'
                          height='140%'
                        >
                          <feTurbulence
                            baseFrequency='0.04'
                            numOctaves='2'
                            result='noise'
                          />
                          <feDisplacementMap
                            in='SourceGraphic'
                            in2='noise'
                            scale='1.8'
                          />
                        </filter>
                        {card.imageUrl && !card.isLoading && (
                          <clipPath id={`frame-clip-${card.id}`}>
                            <path
                              d='
                                 M 30,25 Q 20,10 10,20 Q 15,30 25,25 Q 35,20 45,25
                                 Q 60,20 80,25 Q 100,20 120,25 Q 140,20 160,25
                                 Q 180,20 200,25 Q 220,20 240,25 Q 260,20 280,25
                                 Q 300,20 320,25 Q 340,20 360,25 Q 370,30 380,25
                                 Q 390,20 385,10 Q 375,15 365,25 L 370,35
                                 Q 375,50 370,70 Q 375,100 370,130 Q 375,160 370,190
                                 Q 375,220 370,250 L 365,270 Q 375,285 385,280
                                 Q 390,270 380,260 Q 370,265 360,270 Q 340,275 320,270
                                 Q 300,275 280,270 Q 260,275 240,270 Q 220,275 200,270
                                 Q 180,275 160,270 Q 140,275 120,270 Q 100,275 80,270
                                 Q 60,275 45,270 Q 35,275 25,270 Q 15,265 10,275
                                 Q 5,285 15,280 Q 25,285 30,270 L 25,250
                                 Q 20,220 25,190 Q 20,160 25,130 Q 20,100 25,70
                                 Q 20,50 25,35 L 30,25
                                 Z
                                 M 65,60 L 335,60 L 335,240 L 65,240 Z
                               '
                            />
                          </clipPath>
                        )}
                      </defs>

                      {/* Art Image with Frame Mask */}
                      {card.imageUrl && !card.isLoading && (
                        <image
                          href={card.imageUrl}
                          x='0'
                          y='0'
                          width='400'
                          height='300'
                          preserveAspectRatio='xMidYMid slice'
                          clipPath={`url(#frame-clip-${card.id})`}
                        />
                      )}

                      {/* Loading indicator or placeholder */}
                      {card.isLoading && (
                        <rect
                          x='0'
                          y='0'
                          width='400'
                          height='300'
                          fill='#e5e7eb'
                          className='animate-pulse'
                          clipPath={`url(#frame-clip-${card.id})`}
                        />
                      )}

                      {/* Frame with White Fill and Transparent Center */}
                      <path
                        d='
                            M 30,25 Q 20,10 10,20 Q 15,30 25,25 Q 35,20 45,25
                            Q 60,20 80,25 Q 100,20 120,25 Q 140,20 160,25
                            Q 180,20 200,25 Q 220,20 240,25 Q 260,20 280,25
                            Q 300,20 320,25 Q 340,20 360,25 Q 370,30 380,25
                            Q 390,20 385,10 Q 375,15 365,25 L 370,35
                            Q 375,50 370,70 Q 375,100 370,130 Q 375,160 370,190
                            Q 375,220 370,250 L 365,270 Q 375,285 385,280
                            Q 390,270 380,260 Q 370,265 360,270 Q 340,275 320,270
                            Q 300,275 280,270 Q 260,275 240,270 Q 220,275 200,270
                            Q 180,275 160,270 Q 140,275 120,270 Q 100,275 80,270
                            Q 60,275 45,270 Q 35,275 25,270 Q 15,265 10,275
                            Q 5,285 15,280 Q 25,285 30,270 L 25,250
                            Q 20,220 25,190 Q 20,160 25,130 Q 20,100 25,70
                            Q 20,50 25,35 L 30,25
                            Z
                            M 45,40 L 355,40 L 355,260 L 45,260 Z
                          '
                        fill='white'
                        fillRule='evenodd'
                        stroke='black'
                        strokeWidth='2'
                        filter={`url(#rough-${card.id})`}
                      />

                      {/* Decorative corner elements */}
                      <g
                        stroke='black'
                        strokeWidth='1'
                        fill='none'
                        opacity='0.4'
                      >
                        <path
                          d='M 30,30 Q 25,25 20,30 Q 25,35 30,30'
                          filter={`url(#rough-${card.id})`}
                        />
                        <path
                          d='M 370,30 Q 375,25 380,30 Q 375,35 370,30'
                          filter={`url(#rough-${card.id})`}
                        />
                        <path
                          d='M 30,270 Q 25,275 20,270 Q 25,265 30,270'
                          filter={`url(#rough-${card.id})`}
                        />
                        <path
                          d='M 370,270 Q 375,275 380,270 Q 375,265 370,270'
                          filter={`url(#rough-${card.id})`}
                        />
                      </g>
                    </svg>
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

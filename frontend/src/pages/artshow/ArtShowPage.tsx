import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { portfolioApi } from '../../services/api';

// Import all frame variations
import frame1 from '../../assets/frame/frame-variation-1-bubbly.svg';
import frame2 from '../../assets/frame/frame-variation-2-spiky.svg';
import frame3 from '../../assets/frame/frame-variation-3-wavy.svg';
import frame4 from '../../assets/frame/frame-variation-4-chunky.svg';
import frame5 from '../../assets/frame/frame-variation-5-curly.svg';
import frame6 from '../../assets/frame/frame-variation-6-torn.svg';
import frame7 from '../../assets/frame/frame-variation-7-simple.svg';
import frame8 from '../../assets/frame/frame-variation-8-angular.svg';
import frame9 from '../../assets/frame/frame-variation-9-flowing.svg';
import frame10 from '../../assets/frame/frame-variation-10-rough.svg';

// Array of all available frames
const frameVariations = [
  frame1,
  frame2,
  frame3,
  frame4,
  frame5,
  frame6,
  frame7,
  frame8,
  frame9,
  frame10,
];

// Function to get a random frame
const getRandomFrame = () => {
  return frameVariations[Math.floor(Math.random() * frameVariations.length)];
};

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
  frameUrl?: string;
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

  // Card management - simplified approach with 20 card batches
  const [visibleCards, setVisibleCards] = useState<ArtCard[]>([]);
  const [allGeneratedCards, setAllGeneratedCards] = useState<ArtCard[]>([]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [lastGeneratedX, setLastGeneratedX] = useState(200);
  const lastGenerationTimeRef = useRef(0);
  const hasGeneratedInitialBatchRef = useRef(false);
  const isThrottledRef = useRef(false);
  const throttleTimeoutRef = useRef<number | null>(null);
  const hasUpdatedArtDataRef = useRef(false);

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

  // Generate a batch of 20 cards
  const generateCardBatch = useCallback(() => {
    if (isGeneratingBatch) {
      console.log('🚫 Batch generation already in progress, skipping...');
      return;
    }

    // Throttle check - prevent multiple calls within 2 seconds
    if (isThrottledRef.current) {
      console.log('🚫 Throttled: batch generation blocked');
      return;
    }

    console.log('🎯 Starting batch generation...');
    console.log('📍 Current lastGeneratedX:', lastGeneratedX);
    console.log('📊 Total cards before batch:', allGeneratedCards.length);
    console.log(
      '🏁 Has generated initial batch:',
      hasGeneratedInitialBatchRef.current
    );

    // Set throttle flag
    isThrottledRef.current = true;

    // Clear any existing throttle timeout
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }

    // Set throttle timeout for 2 seconds
    throttleTimeoutRef.current = window.setTimeout(() => {
      isThrottledRef.current = false;
      throttleTimeoutRef.current = null;
    }, 2000);

    setIsGeneratingBatch(true);
    const batchSize = 20; // Fixed batch size of 20 cards
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

    // Create a combined array of all cards to check against (existing + current batch)
    const allCardsToCheck = [...allGeneratedCards];

    for (let i = 0; i < batchSize; i++) {
      // Simple placeholder dimensions - will be updated when art loads
      const cardWidth = 300;
      const cardHeight = 200;

      // Try multiple positions to find a non-overlapping spot
      let attempts = 0;
      const maxAttempts = 15;
      let newX: number = 0;
      let newY: number = 0;
      let positionFound = false;

      while (attempts < maxAttempts && !positionFound) {
        attempts++;

        // Start with reasonable spacing and increase if needed
        const baseSpacing = 350; // Increased from 300
        const spacing = baseSpacing + attempts * 20; // Increase spacing with each attempt
        newX = currentX + spacing;

        // Calculate Y position with more conservative bounds
        const minY = 50;
        const maxY = containerHeight * 0.7 - cardHeight;
        newY = Math.max(minY, Math.random() * (maxY - minY) + minY);

        // Check if this position would overlap with any cards (existing + current batch)
        const wouldOverlap = allCardsToCheck.some(existingCard => {
          const existingEndX = existingCard.x + existingCard.width;
          const newEndX = newX + cardWidth;
          const existingEndY = existingCard.y + existingCard.height;
          const newEndY = newY + cardHeight;

          // Check for overlap on both X and Y axes with some buffer
          const xOverlap = !(
            newEndX + 20 < existingCard.x || newX > existingEndX + 20
          );
          const yOverlap = !(
            newEndY + 20 < existingCard.y || newY > existingEndY + 20
          );

          return xOverlap && yOverlap;
        });

        if (!wouldOverlap) {
          positionFound = true;
        }
      }

      if (!positionFound) {
        console.warn(
          `⚠️ Could not find non-overlapping position for card ${
            i + 1
          } after ${maxAttempts} attempts, using fallback position...`
        );
        // Fallback: just move far to the right
        newX = currentX + 500;
        newY = Math.random() * (containerHeight * 0.6) + 50;
      }

      const cardId = Date.now() + Math.random() + i;
      const newCard = {
        id: cardId,
        x: newX,
        y: newY,
        width: cardWidth,
        height: cardHeight,
        opacity: Math.random() * 0.3 + 0.7,
        aspectRatio: 1.5,
        isLoading: true,
        frameUrl: getRandomFrame(),
      };

      newCards.push(newCard);

      // Update currentX to the end position of this card for next iteration
      currentX = newX + cardWidth;
    }

    console.log(
      `📦 Generated batch of ${batchSize} cards (20-card batch). Last card ends at: ${currentX}`
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

                  // Scale the card to match the image's aspect ratio
                  // This ensures the frame SVG (blue box) is proportional to the art image
                  const baseSize = 300;
                  let cardWidth, cardHeight;

                  if (imageAspectRatio >= 1) {
                    // Landscape image - use width as base
                    cardWidth = baseSize;
                    cardHeight = baseSize / imageAspectRatio;
                  } else {
                    // Portrait image - use height as base
                    cardHeight = baseSize;
                    cardWidth = baseSize * imageAspectRatio;
                  }

                  // Ensure minimum size
                  const minSize = 200;
                  if (cardWidth < minSize) {
                    cardWidth = minSize;
                    cardHeight = minSize / imageAspectRatio;
                  }
                  if (cardHeight < minSize) {
                    cardHeight = minSize;
                    cardWidth = minSize * imageAspectRatio;
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

    // Get current cards and calculate visible ones
    setAllGeneratedCards(prevCards => {
      const visible = prevCards.filter(
        card => card.x >= visibleStart && card.x <= visibleEnd
      );

      console.log(
        '👁️ Setting visible cards:',
        visible.length,
        'out of',
        prevCards.length
      );
      setVisibleCards(visible);
      return prevCards;
    });
  }, []); // No dependencies needed since we use functional state updates

  // Clean up old cards that are far behind the current scroll position
  const cleanupOldCards = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const currentScrollLeft = container.scrollLeft;
    const currentViewportWidth = rect.width;

    // Remove cards that are more than 5 viewport widths behind
    const cleanupThreshold = currentScrollLeft - currentViewportWidth * 5;
    if (cleanupThreshold > 0) {
      setAllGeneratedCards(prevCards => {
        const beforeCleanup = prevCards.length;
        const filtered = prevCards.filter(card => card.x >= cleanupThreshold);
        if (filtered.length < beforeCleanup) {
          console.log(
            `🧹 Cleaned up ${beforeCleanup - filtered.length} old cards`
          );
        }
        return filtered;
      });
    }
  }, []); // No dependencies needed since we use functional state updates

  // Check if we need to generate more cards when user reaches the end
  const checkAndGenerateMoreCards = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isGeneratingBatch) return;

    const rect = container.getBoundingClientRect();
    const scrollRight = container.scrollLeft + rect.width;

    // Safety check: if lastGeneratedX is unreasonably large, reset it more conservatively
    if (lastGeneratedX > 5000) {
      console.warn(
        '⚠️ Position reset: lastGeneratedX was too large, resetting to current scroll position'
      );
      // Reset to current scroll position instead of a fixed value
      const newStartX = Math.max(200, container.scrollLeft + rect.width);
      setLastGeneratedX(newStartX);
      return;
    }

    // Generate more cards only when user has reached the end (within 1 viewport width)
    if (scrollRight > lastGeneratedX - rect.width) {
      console.log('🚀 User reached end - triggering batch generation...');
      console.log('📍 Scroll position:', container.scrollLeft);
      console.log('📍 Scroll right edge:', scrollRight);
      console.log('📍 Last generated X:', lastGeneratedX);
      console.log('📍 Threshold:', lastGeneratedX - rect.width);
      lastGenerationTimeRef.current = Date.now(); // Update last generation time
      generateCardBatch();
    }
  }, [lastGeneratedX, isGeneratingBatch, generateCardBatch]);

  // Initialize container dimensions
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setContainerHeight(800); // Fixed height for the art gallery
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      // Clean up throttle timeout on unmount
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []); // Remove dependencies to prevent re-runs

  // Generate initial batch of cards only once
  useEffect(() => {
    if (!hasGeneratedInitialBatchRef.current) {
      console.log('🎬 Initial batch generation triggered');
      generateCardBatch();
      hasGeneratedInitialBatchRef.current = true;

      // Update visible cards after initial generation
      setTimeout(() => {
        updateVisibleCards();
      }, 100);
    }
  }, []); // Empty dependency array - only run once on mount

  // Load art data on component mount (non-blocking)
  useEffect(() => {
    loadArtProjects();
  }, [loadArtProjects]);

  // Update visible cards whenever allGeneratedCards changes
  useEffect(() => {
    if (allGeneratedCards.length > 0) {
      console.log(
        '🔄 Updating visible cards, total cards:',
        allGeneratedCards.length
      );
      updateVisibleCards();
    }
  }, [allGeneratedCards]); // Remove updateVisibleCards from dependencies

  // Update existing cards with art data when it becomes available
  useEffect(() => {
    if (
      artDataLoaded &&
      artProjects.length > 0 &&
      !hasUpdatedArtDataRef.current
    ) {
      console.log('🔄 Updating existing cards with art data...');
      hasUpdatedArtDataRef.current = true;

      // Small delay to ensure art data is fully processed
      setTimeout(async () => {
        setAllGeneratedCards(prevCards => {
          Promise.all(
            prevCards.map(async card => {
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

                  // Scale the card to match the image's aspect ratio
                  // This ensures the frame SVG (blue box) is proportional to the art image
                  const baseSize = 300;
                  let cardWidth, cardHeight;

                  if (imageAspectRatio >= 1) {
                    // Landscape image - use width as base
                    cardWidth = baseSize;
                    cardHeight = baseSize / imageAspectRatio;
                  } else {
                    // Portrait image - use height as base
                    cardHeight = baseSize;
                    cardWidth = baseSize * imageAspectRatio;
                  }

                  // Ensure minimum size
                  const minSize = 200;
                  if (cardWidth < minSize) {
                    cardWidth = minSize;
                    cardHeight = minSize / imageAspectRatio;
                  }
                  if (cardHeight < minSize) {
                    cardHeight = minSize;
                    cardWidth = minSize * imageAspectRatio;
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
          ).then(updatedCards => {
            const updatedCount = updatedCards.filter(
              card => !card.isLoading
            ).length;
            console.log(`✅ Updated ${updatedCount} cards with art data`);
            setAllGeneratedCards(updatedCards);
          });

          return prevCards; // Return current state while async operation is in progress
        });
      }, 100); // Small delay to ensure art data is ready
    }
  }, [artDataLoaded, artProjects, getRandomArtProject, getImageDimensions]);

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
        cleanupOldCards(); // Clean up old cards
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
  }, []); // Empty dependency array - functions are stable

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
      {/* Global SVG Definitions for Clip Paths */}
      <svg
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          overflow: 'hidden',
        }}
      >
        <defs>
          {/* Base clip path for 400x300 frame (original SVG viewBox) */}
          <clipPath id='frame-clip-base'>
            <rect x='35' y='35' width='330' height='230' />
          </clipPath>
        </defs>
      </svg>

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
                    {/* External Frame SVG with Art Image */}
                    <div className='relative w-full h-full'>
                      {/* Art Image Background - Scaled to fill frame's transparent center */}
                      {card.imageUrl && !card.isLoading && (
                        <div
                          className='absolute'
                          style={{
                            left: '8.75%', // 35/400 = 8.75%
                            top: '11.67%', // 35/300 = 11.67%
                            width: '82.5%', // 330/400 = 82.5%
                            height: '76.67%', // 230/300 = 76.67%
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={card.imageUrl}
                            alt={card.title || 'Art piece'}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      )}

                      {/* Loading indicator or placeholder */}
                      {card.isLoading && (
                        <div className='absolute inset-0 bg-gray-200 animate-pulse' />
                      )}

                      {/* External Frame SVG */}
                      <img
                        src={card.frameUrl}
                        alt='Frame'
                        className='absolute inset-0 w-full h-full'
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                        }}
                      />
                    </div>
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

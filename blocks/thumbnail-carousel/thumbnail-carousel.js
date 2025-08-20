import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Creates navigation controls for the carousel
 * @param {Array} images Array of image elements
 * @returns {Element} The navigation controls element
 */
function createNavigation(images) {
  const navigation = document.createElement('div');
  navigation.className = 'thumbnail-carousel-navigation';
  
  // Create thumbnails container
  const thumbnailsContainer = document.createElement('div');
  thumbnailsContainer.className = 'thumbnail-carousel-thumbnails';
  
  // Create thumbnails as dots
  images.forEach((img, index) => {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail-carousel-thumbnail';
    thumbnail.id = `thumbnail-${index}`;
    thumbnail.setAttribute('role', 'button');
    thumbnail.setAttribute('tabindex', '0');
    
    if (index === 0) {
      thumbnail.classList.add('active');
      thumbnail.setAttribute('aria-selected', 'true');
    } else {
      thumbnail.setAttribute('aria-selected', 'false');
    }
    
    // We still create the image element but it's hidden via CSS
    // This maintains the connection to the original image for tracking
    const thumbImg = createOptimizedPicture(img.src, img.alt, false, [{ width: '100' }]);
    moveInstrumentation(img, thumbImg.querySelector('img'));
    thumbnail.appendChild(thumbImg);
    
    // Add data attribute for tracking
    thumbnail.setAttribute('data-index', index);
    thumbnail.setAttribute('aria-label', `Slide ${index + 1}`);
    
    thumbnailsContainer.appendChild(thumbnail);
  });
  
  // Create left arrow
  const prevButton = document.createElement('button');
  prevButton.className = 'thumbnail-carousel-button-prev';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.innerHTML = '←';
  prevButton.disabled = true; // Initially disabled
  
  // Create right arrow
  const nextButton = document.createElement('button');
  nextButton.className = 'thumbnail-carousel-button-next';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.innerHTML = '→';
  if (images.length <= 1) {
    nextButton.disabled = true;
  }
  
  // Assemble navigation - order changed to match design
  navigation.appendChild(thumbnailsContainer);
  navigation.appendChild(prevButton);
  navigation.appendChild(nextButton);
  
  return navigation;
}

/**
 * Decorates the thumbnail carousel block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Get block configuration
  const blockConfig = {};
  const blockRows = [...block.querySelectorAll(':scope > div')];
  
  // Find configuration rows (those with 2 columns where first column is a label)
  blockRows.forEach((row) => {
    const cols = [...row.children];
    if (cols.length === 2) {
      const key = cols[0].textContent.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const value = cols[1].textContent.trim();
      if (key && value) {
        blockConfig[key] = value;
        
        // Remove this row from the block as it's a configuration row, not a content row
        row.remove();
      }
    }
  });
  
  // Apply style if specified
  const style = blockConfig.style || 'default';
  block.classList.add(`thumbnail-carousel-style-${style}`);
  
  // Apply navigation position if specified
  const navPosition = blockConfig.navigationposition || 'bottom-right';
  block.classList.add(`thumbnail-carousel-nav-${navPosition}`);
  
  // Create container elements
  const container = document.createElement('div');
  container.className = 'thumbnail-carousel-container';
  container.setAttribute('role', 'region');
  container.setAttribute('aria-roledescription', 'carousel');
  container.setAttribute('aria-label', 'Image carousel');
  
  const mainImageContainer = document.createElement('div');
  mainImageContainer.className = 'thumbnail-carousel-main';
  mainImageContainer.setAttribute('aria-live', 'polite');
  
  // Process block content
  const rows = [...block.children];
  if (rows.length === 0) return;
  
  // Extract images
  const images = [];
  
  rows.forEach((row) => {
    const cols = [...row.children];
    
    // Check if this row has an image
    if (cols.length > 0) {
      const img = cols[0].querySelector('img');
      if (img) {
        images.push(img);
      }
    }
  });
  
  // Create main image
  if (images.length > 0) {
    const mainImg = images[0];
    const optimizedPic = createOptimizedPicture(mainImg.src, mainImg.alt, false, [{ width: '1200' }]);
    moveInstrumentation(mainImg, optimizedPic.querySelector('img'));
    mainImageContainer.appendChild(optimizedPic);
  }
  
  // Create navigation with thumbnails
  const navigation = createNavigation(images);
  
  // Add event listeners
  const thumbnails = navigation.querySelectorAll('.thumbnail-carousel-thumbnail');
  const prevButton = navigation.querySelector('.thumbnail-carousel-button-prev');
  const nextButton = navigation.querySelector('.thumbnail-carousel-button-next');
  
  let currentIndex = 0;
  
  // Function to update carousel
  function updateCarousel(index) {
    // Ensure index is within bounds
    const newIndex = Math.max(0, Math.min(index, images.length - 1));
    
    if (newIndex === currentIndex) return;
    
    currentIndex = newIndex;
    
    // Update main image without removing navigation
    const mainImgContainer = mainImageContainer.querySelector('picture') || mainImageContainer.firstChild;
    if (mainImgContainer) {
      const newMainImg = createOptimizedPicture(images[currentIndex].src, images[currentIndex].alt, false, [{ width: '1200' }]);
      mainImageContainer.replaceChild(newMainImg, mainImgContainer);
    }
    
    // Update thumbnails and ARIA attributes
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentIndex);
      thumb.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
    });
    
    // Update ARIA attributes for the container
    container.setAttribute('aria-activedescendant', `thumbnail-${currentIndex}`);
    
    // Update button states
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === images.length - 1;
  }
  
  // Add click and keyboard handlers to thumbnails
  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', () => {
      const index = parseInt(thumbnail.getAttribute('data-index'), 10);
      updateCarousel(index);
    });
    
    // Add keyboard support for thumbnails
    thumbnail.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const index = parseInt(thumbnail.getAttribute('data-index'), 10);
        updateCarousel(index);
      }
    });
  });
  
  // Add click handlers to buttons
  prevButton.addEventListener('click', () => {
    updateCarousel(currentIndex - 1);
  });
  
  nextButton.addEventListener('click', () => {
    updateCarousel(currentIndex + 1);
  });
  
  // Add keyboard navigation
  container.setAttribute('tabindex', '0');
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      updateCarousel(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      updateCarousel(currentIndex + 1);
    }
  });
  
  // Add touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  mainImageContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  mainImageContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance required for a swipe
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left - go to next slide
      updateCarousel(currentIndex + 1);
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right - go to previous slide
      updateCarousel(currentIndex - 1);
    }
  }
  
  // Assemble the carousel - navigation is now inside mainImageContainer
  mainImageContainer.appendChild(navigation);
  container.appendChild(mainImageContainer);
  
  // Replace block content
  block.textContent = '';
  block.appendChild(container);
}

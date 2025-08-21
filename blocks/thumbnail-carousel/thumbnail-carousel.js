import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Creates a content element for the carousel
 * @param {Object} contentData The content data
 * @returns {Element} The content element
 */
function createContent(contentData) {
  const { title, subtitle, description, icons, buttonText, buttonLink } = contentData;
  
  const content = document.createElement('div');
  content.className = 'thumbnail-carousel-content';
  
  // Add subtitle if available
  if (subtitle) {
    const subtitleEl = document.createElement('div');
    subtitleEl.className = 'thumbnail-carousel-subtitle';
    subtitleEl.textContent = subtitle;
    content.appendChild(subtitleEl);
  }
  
  // Add title if available
  if (title) {
    const titleEl = document.createElement('h2');
    titleEl.className = 'thumbnail-carousel-title';
    titleEl.innerHTML = title;
    content.appendChild(titleEl);
  }
  
  // Add icons if available
  if (icons && icons.length > 0) {
    const iconsContainer = document.createElement('div');
    iconsContainer.className = 'thumbnail-carousel-icons';
    
    icons.forEach(icon => {
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'thumbnail-carousel-icon';
      
      const iconImg = icon.img;
      const iconText = icon.text;
      
      if (iconImg) {
        iconWrapper.appendChild(iconImg.cloneNode(true));
      }
      
      if (iconText) {
        const textEl = document.createElement('span');
        textEl.textContent = iconText;
        iconWrapper.appendChild(textEl);
      }
      
      iconsContainer.appendChild(iconWrapper);
    });
    
    content.appendChild(iconsContainer);
  }
  
  // Add description if available
  if (description) {
    const descEl = document.createElement('div');
    descEl.className = 'thumbnail-carousel-description';
    descEl.innerHTML = description;
    content.appendChild(descEl);
  }
  
  // Add button if available
  if (buttonText && buttonLink) {
    const button = document.createElement('a');
    button.className = 'thumbnail-carousel-button';
    button.href = buttonLink;
    button.textContent = buttonText;
    content.appendChild(button);
  }
  
  return content;
}

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
  
  // Create thumbnails as actual small images
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
    
    // Create optimized thumbnail image
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
  navigation.appendChild(prevButton);
  navigation.appendChild(thumbnailsContainer);
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
  
  // Extract images and content data
  const images = [];
  const contentData = {
    subtitle: '',
    title: '',
    description: '',
    icons: [],
    buttonText: '',
    buttonLink: ''
  };
  
  rows.forEach((row) => {
    const cols = [...row.children];
    
    // Check if this row has an image
    if (cols.length > 0) {
      const img = cols[0].querySelector('img');
      if (img) {
        images.push(img);
      } else {
        // Check if this is a thumbnail-item component
        const thumbnailItem = cols[0].querySelector('.thumbnail-item');
        if (thumbnailItem) {
          const thumbnailImg = thumbnailItem.querySelector('img');
          if (thumbnailImg) {
            images.push(thumbnailImg);
          }
        }
      }
      
      // Extract content data from second column if it exists
      if (cols.length >= 2) {
        // Look for subtitle (usually a small text before the title)
        const subtitle = cols[1].querySelector('p.subtitle, .subtitle, em');
        if (subtitle) {
          contentData.subtitle = subtitle.textContent.trim();
        }
        
        // Look for title
        const title = cols[1].querySelector('h1, h2, h3, h4, h5, h6');
        if (title) {
          contentData.title = title.innerHTML.trim();
        }
        
        // Look for icons (usually small images with text)
        const icons = cols[1].querySelectorAll('.icon, .icons .icon');
        if (icons.length > 0) {
          icons.forEach(icon => {
            const iconImg = icon.querySelector('img');
            const iconText = icon.textContent.trim();
            contentData.icons.push({ img: iconImg, text: iconText });
          });
        }
        
        // Look for description (usually paragraphs after the title)
        const paragraphs = cols[1].querySelectorAll('p:not(.subtitle)');
        if (paragraphs.length > 0) {
          // Combine all paragraphs into one description
          contentData.description = Array.from(paragraphs)
            .map(p => p.innerHTML)
            .join('<br><br>');
        }
        
        // Look for button
        const link = cols[1].querySelector('a');
        if (link) {
          contentData.buttonText = link.textContent.trim();
          contentData.buttonLink = link.href;
        }
      }
    }
  });
  
  // If no images were found, add placeholder images for authoring
  if (images.length === 0) {
    // Create placeholder images
    for (let i = 0; i < 3; i += 1) {
      const placeholderImg = document.createElement('img');
      placeholderImg.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22400%22%20viewBox%3D%220%200%20800%20400%22%3E%3Crect%20fill%3D%22%23ddd%22%20width%3D%22800%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23555%22%20font-family%3D%22sans-serif%22%20font-size%3D%2230%22%20x%3D%22400%22%20y%3D%22200%22%20text-anchor%3D%22middle%22%3EPlaceholder%20Image%20${i + 1}%3C%2Ftext%3E%3C%2Fsvg%3E';
      placeholderImg.alt = `Placeholder Image ${i + 1}`;
      placeholderImg.width = 800;
      placeholderImg.height = 400;
      images.push(placeholderImg);
    }
  }
  
  // Create a message for authors to add thumbnail items
  const authoringMessage = document.createElement('div');
  authoringMessage.className = 'thumbnail-carousel-authoring-message';
  authoringMessage.innerHTML = `
    <p>To add images to this carousel, use the "+" button in the editor to add Thumbnail Item components.</p>
    <p>Each Thumbnail Item should contain an image that will be displayed in the carousel.</p>
  `;
  block.appendChild(authoringMessage);
  
  // Create main image
  if (images.length > 0) {
    const mainImg = images[0];
    const optimizedPic = createOptimizedPicture(mainImg.src, mainImg.alt, false, [{ width: '1200' }]);
    moveInstrumentation(mainImg, optimizedPic.querySelector('img'));
    mainImageContainer.appendChild(optimizedPic);
  }
  
  // Create content section if there's content data
  if (contentData.title || contentData.description || contentData.buttonText) {
    const contentSection = createContent(contentData);
    mainImageContainer.appendChild(contentSection);
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
    
    // Update main image without removing navigation or content
    const mainImgContainer = mainImageContainer.querySelector('picture');
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
  
  // Assemble the carousel
  mainImageContainer.appendChild(navigation);
  container.appendChild(mainImageContainer);
  
  // Replace block content but keep the authoring message
  const authoringMessageCopy = authoringMessage.cloneNode(true);
  block.textContent = '';
  block.appendChild(container);
  block.appendChild(authoringMessageCopy);
}

import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Creates a card element
 * @param {Object} cardData The card data
 * @returns {Element} The card element
 */
function createCard(cardData) {
  const { image, title, description, buttonText, buttonLink } = cardData;
  
  const card = document.createElement('div');
  card.className = 'card-carousel-item';
  
  // Create image
  if (image) {
    const picture = createOptimizedPicture(image.src, image.alt, false, [{ width: '600' }]);
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'card-carousel-image';
    imageWrapper.appendChild(picture);
    card.appendChild(imageWrapper);
  }
  
  // Create content container
  const content = document.createElement('div');
  content.className = 'card-carousel-content';
  
  // Add title if available
  if (title) {
    const titleEl = document.createElement('h3');
    titleEl.className = 'card-carousel-title';
    titleEl.textContent = title;
    content.appendChild(titleEl);
  }
  
  // Add description if available
  if (description) {
    const descEl = document.createElement('div');
    descEl.className = 'card-carousel-description';
    descEl.innerHTML = description;
    content.appendChild(descEl);
  }
  
  // Add button if available
  if (buttonText && buttonLink) {
    const button = document.createElement('a');
    button.className = 'card-carousel-button';
    button.href = buttonLink;
    button.textContent = buttonText;
    
    // Add arrow icon to button
    const arrow = document.createElement('span');
    arrow.className = 'card-carousel-button-arrow';
    arrow.innerHTML = '→';
    button.appendChild(arrow);
    
    content.appendChild(button);
  }
  
  card.appendChild(content);
  return card;
}

/**
 * Creates navigation controls for the carousel
 * @param {number} totalSlides Total number of slides
 * @param {number} visibleSlides Number of visible slides
 * @returns {Element} The navigation controls element
 */
function createNavigation(totalSlides, visibleSlides) {
  const navigation = document.createElement('div');
  navigation.className = 'card-carousel-navigation';
  
  // Create progress bar container
  const progressContainer = document.createElement('div');
  progressContainer.className = 'card-carousel-progress-container';
  
  // Calculate number of steps in progress bar
  const totalSteps = Math.max(1, totalSlides - visibleSlides + 1);
  
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'card-carousel-progress-bar';
  
  // Create progress indicators
  for (let i = 0; i < totalSteps; i += 1) {
    const indicator = document.createElement('div');
    indicator.className = 'card-carousel-progress-indicator';
    indicator.setAttribute('data-index', i);
    if (i === 0) {
      indicator.classList.add('active');
    }
    progressBar.appendChild(indicator);
  }
  
  progressContainer.appendChild(progressBar);
  
  // Create navigation buttons
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'card-carousel-buttons';
  
  const prevButton = document.createElement('button');
  prevButton.className = 'card-carousel-button-prev';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.innerHTML = '←';
  prevButton.disabled = true; // Initially disabled
  
  const nextButton = document.createElement('button');
  nextButton.className = 'card-carousel-button-next';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.innerHTML = '→';
  if (totalSlides <= visibleSlides) {
    nextButton.disabled = true;
  }
  
  buttonsContainer.appendChild(prevButton);
  buttonsContainer.appendChild(nextButton);
  
  navigation.appendChild(progressContainer);
  navigation.appendChild(buttonsContainer);
  
  return navigation;
}

/**
 * Decorates the card carousel block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Create container elements
  const container = document.createElement('div');
  container.className = 'card-carousel-container';
  
  const track = document.createElement('div');
  track.className = 'card-carousel-track';
  
  // Process block content
  const rows = [...block.children];
  if (rows.length === 0) return;
  
  // Extract card data
  const cards = [];
  
  rows.forEach((row) => {
    const cols = [...row.children];
    
    // Check if this row has the expected structure for a card
    if (cols.length >= 1) {
      const cardData = {};
      
      // Extract image if present
      const img = cols[0].querySelector('img');
      if (img) {
        cardData.image = {
          src: img.src,
          alt: img.alt || '',
        };
      }
      
      // Extract title, description, and button if present
      if (cols.length >= 2) {
        const title = cols[1].querySelector('h1, h2, h3, h4, h5, h6');
        if (title) {
          cardData.title = title.textContent.trim();
        }
        
        const paragraphs = cols[1].querySelectorAll('p');
        if (paragraphs.length > 0) {
          cardData.description = paragraphs[0].innerHTML;
        }
        
        const link = cols[1].querySelector('a');
        if (link) {
          cardData.buttonText = link.textContent.trim();
          cardData.buttonLink = link.href;
        }
      }
      
      cards.push(cardData);
    }
  });
  
  // Define number of visible cards
  const visibleCards = 4;
  
  // Create cards and add to track
  cards.forEach((cardData) => {
    const card = createCard(cardData);
    track.appendChild(card);
  });
  
  // Add track to container
  container.appendChild(track);
  
  // Create and add navigation
  const navigation = createNavigation(cards.length, visibleCards);
  container.appendChild(navigation);
  
  // Replace block content
  block.textContent = '';
  block.appendChild(container);
  
  // Set up carousel functionality
  let currentIndex = 0;
  const maxIndex = Math.max(0, cards.length - visibleCards);
  
  const prevButton = navigation.querySelector('.card-carousel-button-prev');
  const nextButton = navigation.querySelector('.card-carousel-button-next');
  const indicators = navigation.querySelectorAll('.card-carousel-progress-indicator');
  
  // Function to update carousel position
  function updateCarousel(index) {
    // Ensure index is within bounds
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    
    if (newIndex === currentIndex) return;
    
    currentIndex = newIndex;
    
    // Update track position
    const cardWidth = track.querySelector('.card-carousel-item').offsetWidth;
    const gap = parseInt(window.getComputedStyle(track).columnGap || '0', 10);
    const offset = currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
    
    // Update button states
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === maxIndex;
    
    // Update indicators
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === currentIndex);
    });
  }
  
  // Add event listeners to buttons
  prevButton.addEventListener('click', () => {
    updateCarousel(currentIndex - 1);
  });
  
  nextButton.addEventListener('click', () => {
    updateCarousel(currentIndex + 1);
  });
  
  // Add event listeners to indicators
  indicators.forEach((indicator, i) => {
    indicator.addEventListener('click', () => {
      updateCarousel(i);
    });
  });
  
  // Handle responsive behavior
  function handleResize() {
    // Reset transform
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    
    // Reset current index and update UI
    currentIndex = 0;
    prevButton.disabled = true;
    nextButton.disabled = cards.length <= visibleCards;
    
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === 0);
    });
    
    // Restore transition after reset
    setTimeout(() => {
      track.style.transition = '';
    }, 50);
  }
  
  // Add resize listener
  window.addEventListener('resize', handleResize);
  
  // Initial setup
  handleResize();
}

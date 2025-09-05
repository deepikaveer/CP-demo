import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Updates the countdown timer
 * @param {Element} timerElement The timer element
 * @param {Date} endDate The end date for the countdown
 */
function updateCountdown(timerElement, endDate) {
  const now = new Date();
  const timeLeft = endDate - now;
  
  if (timeLeft <= 0) {
    // Timer expired
    timerElement.querySelector('.days').textContent = '00';
    timerElement.querySelector('.hours').textContent = '00';
    timerElement.querySelector('.minutes').textContent = '00';
    timerElement.querySelector('.seconds').textContent = '00';
    return;
  }
  
  // Calculate time components
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  // Update the timer display
  timerElement.querySelector('.days').textContent = days.toString().padStart(2, '0');
  timerElement.querySelector('.hours').textContent = hours.toString().padStart(2, '0');
  timerElement.querySelector('.minutes').textContent = minutes.toString().padStart(2, '0');
  timerElement.querySelector('.seconds').textContent = seconds.toString().padStart(2, '0');
}

/**
 * Creates the countdown timer element
 * @param {number} days Number of days for the countdown
 * @param {number} hours Number of hours for the countdown
 * @param {number} minutes Number of minutes for the countdown
 * @param {number} seconds Number of seconds for the countdown
 * @returns {Element} The timer element
 */
function createCountdownTimer(days = 28, hours = 20, minutes = 45, seconds = 20) {
  const timerContainer = document.createElement('div');
  timerContainer.className = 'expandable-cross-sell-timer';
  
  // Create offer text
  const offerText = document.createElement('div');
  offerText.className = 'offer-text';
  offerText.textContent = 'Offer ends in';
  
  // Create timer display
  const timerDisplay = document.createElement('div');
  timerDisplay.className = 'timer-display';
  
  // Create time units
  const timeUnits = [
    { value: days, label: 'Days', class: 'days' },
    { value: hours, label: 'Hours', class: 'hours' },
    { value: minutes, label: 'Minutes', class: 'minutes' },
    { value: seconds, label: 'Seconds', class: 'seconds' }
  ];
  
  timeUnits.forEach((unit, index) => {
    // Create unit container
    const unitContainer = document.createElement('div');
    unitContainer.className = 'time-unit';
    
    // Create value
    const valueElement = document.createElement('div');
    valueElement.className = `time-value ${unit.class}`;
    valueElement.textContent = unit.value.toString().padStart(2, '0');
    
    // Create label
    const labelElement = document.createElement('div');
    labelElement.className = 'time-label';
    labelElement.textContent = unit.label;
    
    // Add to container
    unitContainer.appendChild(valueElement);
    unitContainer.appendChild(labelElement);
    timerDisplay.appendChild(unitContainer);
    
    // Add separator except after the last unit
    if (index < timeUnits.length - 1) {
      const separator = document.createElement('div');
      separator.className = 'time-separator';
      separator.textContent = '.';
      timerDisplay.appendChild(separator);
    }
  });
  
  // Mobile layout: offer text and timer display are side by side
  const mobileTimerWrapper = document.createElement('div');
  mobileTimerWrapper.className = 'mobile-timer-wrapper';
  mobileTimerWrapper.appendChild(offerText);
  mobileTimerWrapper.appendChild(timerDisplay);
  
  // Desktop layout: offer text is above timer display
  const desktopTimerWrapper = document.createElement('div');
  desktopTimerWrapper.className = 'desktop-timer-wrapper';
  desktopTimerWrapper.appendChild(offerText.cloneNode(true));
  desktopTimerWrapper.appendChild(timerDisplay.cloneNode(true));
  
  // Add both layouts to container
  timerContainer.appendChild(mobileTimerWrapper);
  timerContainer.appendChild(desktopTimerWrapper);
  
  // Calculate end date for the countdown
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  endDate.setHours(endDate.getHours() + hours);
  endDate.setMinutes(endDate.getMinutes() + minutes);
  endDate.setSeconds(endDate.getSeconds() + seconds);
  
  // Store end date as data attribute
  timerContainer.dataset.endDate = endDate.toISOString();
  
  // Start the countdown
  updateCountdown(timerContainer, endDate);
  setInterval(() => updateCountdown(timerContainer, endDate), 1000);
  
  return timerContainer;
}

/**
 * Creates the content for the expandable cross-sell block
 * @param {Object} config The block configuration
 * @returns {Element} The content element
 */
function createContent(config) {
  const contentContainer = document.createElement('div');
  contentContainer.className = 'expandable-cross-sell-content';
  
  // Create heading
  if (config.heading) {
    const heading = document.createElement('h2');
    heading.className = 'expandable-cross-sell-heading';
    
    // Check if heading contains text to be styled differently
    if (config.heading.includes('Spring')) {
      const parts = config.heading.split('Spring');
      heading.innerHTML = `${parts[0]}<span class="highlight">Spring</span>${parts[1]}`;
    } else {
      heading.textContent = config.heading;
    }
    
    contentContainer.appendChild(heading);
  }
  
  // Create description
  if (config.description) {
    const description = document.createElement('p');
    description.className = 'expandable-cross-sell-description';
    description.textContent = config.description;
    contentContainer.appendChild(description);
  }
  
  // Create CTA button
  if (config.ctaText && config.ctaLink) {
    const ctaButton = document.createElement('a');
    ctaButton.className = 'expandable-cross-sell-cta';
    ctaButton.href = config.ctaLink;
    ctaButton.textContent = config.ctaText;
    contentContainer.appendChild(ctaButton);
  }
  
  // Create note
  if (config.note) {
    const note = document.createElement('p');
    note.className = 'expandable-cross-sell-note';
    note.textContent = config.note;
    contentContainer.appendChild(note);
  }
  
  return contentContainer;
}

/**
 * Reads the configuration from the block
 * @param {Element} block The block element
 * @returns {Object} The configuration object
 */
function readBlockConfig(block) {
  const config = {};
  const rows = [...block.children];
  
  rows.forEach((row) => {
    const cols = [...row.children];
    if (cols.length === 2) {
      const key = cols[0].textContent.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const value = cols[1].textContent.trim();
      
      if (key && value) {
        config[key] = value;
      }
    }
  });
  
  return config;
}

/**
 * Decorates the expandable cross-sell block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Extract configuration from block
  const config = readBlockConfig(block);
  
  // Process image if present
  let backgroundImage = null;
  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length >= 1) {
      const img = cols[0].querySelector('img');
      if (img) {
        backgroundImage = img;
      }
    }
  });
  
  // Clear the block content
  block.textContent = '';
  
  // Create container
  const container = document.createElement('div');
  container.className = 'expandable-cross-sell-container';
  
  // Create main block elements
  const blockWrapper = document.createElement('div');
  blockWrapper.className = 'expandable-cross-sell-wrapper';
  
  // Add background image if available
  if (backgroundImage) {
    const picture = createOptimizedPicture(backgroundImage.src, backgroundImage.alt, false, [{ width: '2000' }]);
    picture.className = 'expandable-cross-sell-background';
    blockWrapper.appendChild(picture);
  }
  
  // Create timer with default values (can be overridden by config)
  const days = parseInt(config.days || '28', 10);
  const hours = parseInt(config.hours || '20', 10);
  const minutes = parseInt(config.minutes || '45', 10);
  const seconds = parseInt(config.seconds || '20', 10);
  
  const timer = createCountdownTimer(days, hours, minutes, seconds);
  
  // Create content
  const content = createContent({
    heading: config.heading || 'Step into Spring from £399*',
    description: config.description || 'Enjoy a refreshing spring break at Center Parcs, surrounded by blooming nature and endless family adventures.',
    ctaText: config.ctatext || 'Discover Spring Breaks',
    ctaLink: config.ctalink || '#',
    note: config.note || 'Available to book for a limited time only*'
  });
  
  // Add timer and content to wrapper
  blockWrapper.appendChild(timer);
  blockWrapper.appendChild(content);
  
  // Add expand/collapse functionality
  const expandButton = document.createElement('button');
  expandButton.className = 'expandable-cross-sell-toggle';
  expandButton.setAttribute('aria-label', 'Toggle content');
  expandButton.innerHTML = '<span class="toggle-icon"></span>';
  
  expandButton.addEventListener('click', () => {
    blockWrapper.classList.toggle('expanded');
    const isExpanded = blockWrapper.classList.contains('expanded');
    expandButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  });
  
  blockWrapper.appendChild(expandButton);
  
  // Add wrapper to container
  container.appendChild(blockWrapper);
  
  // Replace block content
  block.textContent = '';
  block.appendChild(container);
}

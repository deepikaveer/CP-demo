import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Updates the countdown timer
 * @param {Element} timerElement The timer element
 * @param {Date} endDate The end date for the countdown
 */
function updateCountdown(timerElement, endDate) {
  const daysEl = timerElement.querySelector('.days-value');
  const hoursEl = timerElement.querySelector('.hours-value');
  const minutesEl = timerElement.querySelector('.minutes-value');
  const secondsEl = timerElement.querySelector('.seconds-value');
  
  const now = new Date();
  const timeDiff = endDate - now;
  
  if (timeDiff <= 0) {
    // Timer expired
    daysEl.textContent = '0';
    hoursEl.textContent = '0';
    minutesEl.textContent = '0';
    secondsEl.textContent = '0';
    return;
  }
  
  // Calculate time units
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
  // Update DOM
  daysEl.textContent = days.toString().padStart(2, '0');
  hoursEl.textContent = hours.toString().padStart(2, '0');
  minutesEl.textContent = minutes.toString().padStart(2, '0');
  secondsEl.textContent = seconds.toString().padStart(2, '0');
}

/**
 * Creates the countdown timer element
 * @param {number} days Number of days
 * @param {number} hours Number of hours
 * @param {number} minutes Number of minutes
 * @param {number} seconds Number of seconds
 * @returns {Element} The countdown timer element
 */
function createCountdownTimer(days, hours, minutes, seconds) {
  const countdownEl = document.createElement('div');
  countdownEl.className = 'masterCarousel-countdown';
  
  // Create label with clock icon
  const labelEl = document.createElement('div');
  labelEl.className = 'masterCarousel-countdown-label';
  
  // Add clock icon SVG
  labelEl.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <span>Offer ends in</span>
  `;
  
  // Create timer
  const timerEl = document.createElement('div');
  timerEl.className = 'masterCarousel-countdown-timer';
  
  // Days
  const daysUnit = document.createElement('div');
  daysUnit.className = 'masterCarousel-countdown-unit days';
  daysUnit.innerHTML = `
    <span class="masterCarousel-countdown-value days-value">${days.toString().padStart(2, '0')}</span>
    <span class="masterCarousel-countdown-label">Days</span>
  `;
  
  // Hours
  const hoursUnit = document.createElement('div');
  hoursUnit.className = 'masterCarousel-countdown-unit hours';
  hoursUnit.innerHTML = `
    <span class="masterCarousel-countdown-value hours-value">${hours.toString().padStart(2, '0')}</span>
    <span class="masterCarousel-countdown-label">Hours</span>
  `;
  
  // Minutes
  const minutesUnit = document.createElement('div');
  minutesUnit.className = 'masterCarousel-countdown-unit minutes';
  minutesUnit.innerHTML = `
    <span class="masterCarousel-countdown-value minutes-value">${minutes.toString().padStart(2, '0')}</span>
    <span class="masterCarousel-countdown-label">Minutes</span>
  `;
  
  // Seconds
  const secondsUnit = document.createElement('div');
  secondsUnit.className = 'masterCarousel-countdown-unit seconds';
  secondsUnit.innerHTML = `
    <span class="masterCarousel-countdown-value seconds-value">${seconds.toString().padStart(2, '0')}</span>
    <span class="masterCarousel-countdown-label">Seconds</span>
  `;
  
  // Add separators
  const separator1 = document.createElement('div');
  separator1.className = 'masterCarousel-countdown-separator';
  separator1.textContent = '•';
  
  const separator2 = document.createElement('div');
  separator2.className = 'masterCarousel-countdown-separator';
  separator2.textContent = '•';
  
  const separator3 = document.createElement('div');
  separator3.className = 'masterCarousel-countdown-separator';
  separator3.textContent = '•';
  
  // Assemble timer
  timerEl.appendChild(daysUnit);
  timerEl.appendChild(separator1);
  timerEl.appendChild(hoursUnit);
  timerEl.appendChild(separator2);
  timerEl.appendChild(minutesUnit);
  timerEl.appendChild(separator3);
  timerEl.appendChild(secondsUnit);
  
  // Assemble countdown
  countdownEl.appendChild(labelEl);
  countdownEl.appendChild(timerEl);
  
  return countdownEl;
}

/**
 * Decorates the masterCarousel block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  return false;
  // Create container elements
  const container = document.createElement('div');
  container.className = 'masterCarousel-container';
  
  const mainImageContainer = document.createElement('div');
  mainImageContainer.className = 'masterCarousel-main';
  
  const thumbnailsContainer = document.createElement('div');
  thumbnailsContainer.className = 'masterCarousel-thumbnails';
  
  // Process block content
  const rows = [...block.children];
  if (rows.length === 0) return;
  
  // Extract images and content
  const images = [];
  let contentRow = null;
  
  rows.forEach((row) => {
    const cols = [...row.children];
    
    // Check if this is a content row (has more than one column or no image)
    if (cols.length > 1 || !cols[0].querySelector('picture')) {
      contentRow = row;
    } else {
      // This is an image row
      const imgCol = cols[0];
      const img = imgCol.querySelector('img');
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
  
  // Create thumbnails
  for (let i = 1; i < images.length; i += 1) {
    const img = images[i];
    const thumbnailDiv = document.createElement('div');
    thumbnailDiv.className = 'masterCarousel-thumbnail';
    
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    thumbnailDiv.appendChild(optimizedPic);
    
    // Add click handler to switch main image
    thumbnailDiv.addEventListener('click', () => {
      const newMainImg = createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]);
      mainImageContainer.innerHTML = '';
      mainImageContainer.appendChild(newMainImg);
    });
    
    thumbnailsContainer.appendChild(thumbnailDiv);
  }
  
  // Create content overlay
  if (contentRow) {
    const contentOverlay = document.createElement('div');
    contentOverlay.className = 'masterCarousel-content';
    
    const cols = [...contentRow.children];
    
    // Process content columns
    cols.forEach((col, index) => {
      if (index === 0) {
        // First column - title and description
        const titleText = col.querySelector('h1, h2, h3, h4, h5, h6')?.innerHTML || 'Step into <em>Spring</em> from £399*';
        const descText = col.querySelector('p')?.innerHTML || 'Enjoy a refreshing spring break at Center Parcs, surrounded by blooming nature and endless family adventures.';
        
        const title = document.createElement('h3');
        title.className = 'masterCarousel-title';
        title.innerHTML = titleText;
        
        const description = document.createElement('div');
        description.className = 'masterCarousel-description';
        description.innerHTML = descText;
        
        contentOverlay.appendChild(title);
        contentOverlay.appendChild(description);
        
        // Create countdown timer - default 28 days, 20 hours, 45 minutes, 60 seconds
        const countdownTimer = createCountdownTimer(28, 20, 45, 60);
        contentOverlay.appendChild(countdownTimer);
        
        // Set up countdown timer functionality
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 28);
        endDate.setHours(endDate.getHours() + 20);
        endDate.setMinutes(endDate.getMinutes() + 45);
        endDate.setSeconds(endDate.getSeconds() + 60);
        
        // Update timer every second
        updateCountdown(countdownTimer, endDate);
        setInterval(() => {
          updateCountdown(countdownTimer, endDate);
        }, 1000);
      } else if (index === 1) {
        // Second column - button
        const buttonText = col.querySelector('a')?.textContent || 'Discover Spring Breaks';
        const buttonHref = col.querySelector('a')?.href || '#';
        
        const button = document.createElement('a');
        button.className = 'masterCarousel-button';
        button.href = buttonHref;
        button.textContent = buttonText;
        
        contentOverlay.appendChild(button);
        
        // Add footer note
        const footerNote = document.createElement('div');
        footerNote.className = 'masterCarousel-footer';
        footerNote.textContent = 'Available to book for a limited time only*';
        contentOverlay.appendChild(footerNote);
      }
    });
    
    mainImageContainer.appendChild(contentOverlay);
  } else {
    // Create default content if no content row provided
    const contentOverlay = document.createElement('div');
    contentOverlay.className = 'masterCarousel-content';
    
    const title = document.createElement('h3');
    title.className = 'masterCarousel-title';
    title.innerHTML = 'Step into <em>Spring</em> from £399*';
    
    const description = document.createElement('div');
    description.className = 'masterCarousel-description';
    description.textContent = 'Enjoy a refreshing spring break at Center Parcs, surrounded by blooming nature and endless family adventures.';
    
    // Create countdown timer
    const countdownTimer = createCountdownTimer(28, 20, 45, 60);
    
    const button = document.createElement('a');
    button.className = 'masterCarousel-button';
    button.href = '#';
    button.textContent = 'Discover Spring Breaks';
    
    const footerNote = document.createElement('div');
    footerNote.className = 'masterCarousel-footer';
    footerNote.textContent = 'Available to book for a limited time only*';
    
    contentOverlay.appendChild(title);
    contentOverlay.appendChild(description);
    contentOverlay.appendChild(countdownTimer);
    contentOverlay.appendChild(button);
    contentOverlay.appendChild(footerNote);
    
    mainImageContainer.appendChild(contentOverlay);
    
    // Set up countdown timer functionality
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 28);
    endDate.setHours(endDate.getHours() + 20);
    endDate.setMinutes(endDate.getMinutes() + 45);
    endDate.setSeconds(endDate.getSeconds() + 60);
    
    // Update timer every second
    updateCountdown(countdownTimer, endDate);
    setInterval(() => {
      updateCountdown(countdownTimer, endDate);
    }, 1000);
  }
  
  // Assemble the carousel
  container.appendChild(mainImageContainer);
  container.appendChild(thumbnailsContainer);
  
  // Replace block content
  block.textContent = '';
  block.appendChild(container);
}

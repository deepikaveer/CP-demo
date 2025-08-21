/**
 * Decorates the thumbnail item block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Add thumbnail-item class to the block
  block.classList.add('thumbnail-item');
  
  // Process block content
  const rows = [...block.children];
  if (rows.length === 0) return;
  
  // Extract image if present
  const img = block.querySelector('img');
  if (img) {
    // Ensure the image has proper styling
    img.classList.add('thumbnail-item-image');
    
    // Create a container for the image if it doesn't exist
    const imgParent = img.parentElement;
    if (!imgParent.classList.contains('thumbnail-item-image-container')) {
      const container = document.createElement('div');
      container.className = 'thumbnail-item-image-container';
      imgParent.insertBefore(container, img);
      container.appendChild(img);
    }
  } else {
    // Create a placeholder image if no image is present
    const placeholderImg = document.createElement('img');
    placeholderImg.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22400%22%20viewBox%3D%220%200%20800%20400%22%3E%3Crect%20fill%3D%22%23ddd%22%20width%3D%22800%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23555%22%20font-family%3D%22sans-serif%22%20font-size%3D%2230%22%20x%3D%22400%22%20y%3D%22200%22%20text-anchor%3D%22middle%22%3EThumbnail%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
    placeholderImg.alt = 'Thumbnail Image';
    placeholderImg.width = 800;
    placeholderImg.height = 400;
    placeholderImg.classList.add('thumbnail-item-image');
    
    const container = document.createElement('div');
    container.className = 'thumbnail-item-image-container';
    container.appendChild(placeholderImg);
    
    // Add the container to the block
    block.appendChild(container);
  }
}

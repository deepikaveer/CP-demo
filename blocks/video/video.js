import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Embeds a Scene7 SmartCropVideoViewer
 * @param {string} asset The asset ID for the video
 * @param {string} configName The Scene7 config name
 * @returns {Element} The video container element
 */
function embedScene7(asset, configName) {
  // Create container div
  const div = document.createElement('div');
  div.id = 's7smartcropvideo_div';
  
  // Add style to head if not already present
  if (!document.getElementById('s7smartcropvideo_style')) {
    const style = document.createElement('style');
    style.id = 's7smartcropvideo_style';
    style.type = 'text/css';
    style.textContent = `
      #s7smartcropvideo_div.s7smartcropvideoviewer {
        width: 100%; 
        height: auto;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Load Scene7 script if not already loaded
  function loadScript(src, callback) {
    if (window.s7viewers) {
      callback();
      return;
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  }
  
  // Initialize Scene7 viewer after script loads
  loadScript('https://centerparcs.scene7.com/s7viewers/html5/js/SmartCropVideoViewer.js', () => {
    const s7smartcropvideoviewer = new window.s7viewers.SmartCropVideoViewer({
      containerId: 's7smartcropvideo_div',
      params: {
        serverurl: 'https://centerparcs.scene7.com/is/image/',
        contenturl: 'https://centerparcs.scene7.com/is/content/',
        config: configName || 'centerparcs/Hero-5',
        videoserverurl: 'https://centerparcs.scene7.com/is/content',
        asset: asset || 'centerparcs/99933 - 42 - Web Hero Videos - Peak Summer - Original-AVS'
      }
    });
    s7smartcropvideoviewer.init();
  });
  
  return div;
}

/**
 * Decorates the video block
 * @param {Element} block The video block element
 */
export default function decorate(block) {
  // Clear existing content
  block.textContent = '';
  
  // Create container for the video
  const container = document.createElement('div');
  container.className = 'video-container';
  
  // Extract configuration from block
  const config = {};
  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length === 2) {
      const key = cols[0].textContent.trim().toLowerCase();
      const value = cols[1].textContent.trim();
      
      if (key && value) {
        config[key] = value;
      }
    }
  });
  
  // Get asset ID from configuration
  const asset = config.asset || 'centerparcs/99933 - 42 - Web Hero Videos - Peak Summer - Original-AVS';
  const configName = config.config || 'centerparcs/Hero-5';
  
  // Create and append the video element
  const videoElement = embedScene7(asset, configName);
  container.appendChild(videoElement);
  
  // Append container to block
  block.appendChild(container);
}

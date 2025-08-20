/*
 * Video Block
 * Show a video with various source options and placeholder functionality
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function embedYoutube(videoId, options = {}) {
  const {
    autoplay = false,
    allowFullscreen = true,
    pictureInPicture = true,
    title = 'Content from YouTube',
  } = options;

  let suffix = '';
  const suffixParams = {
    autoplay: autoplay ? '1' : '0',
    mute: autoplay ? '1' : '0',
    rel: '0',
  };
  suffix = `?${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;

  // Handle both full URLs and just video IDs
  let vid = videoId;
  if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
    const url = new URL(videoId);
    const usp = new URLSearchParams(url.search);
    vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
    
    if (url.origin.includes('youtu.be')) {
      [, vid] = url.pathname.split('/');
    }
  }

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com/embed/${vid}${suffix}" 
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      frameborder="0"
      allow="${autoplay ? 'autoplay; ' : ''}${allowFullscreen ? 'fullscreen; ' : ''}${pictureInPicture ? 'picture-in-picture; ' : ''}encrypted-media; accelerometer; gyroscope" 
      ${allowFullscreen ? 'allowfullscreen' : ''} 
      title="${title}" 
      loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function embedVimeo(videoId, options = {}) {
  const {
    autoplay = false,
    allowFullscreen = true,
    pictureInPicture = true,
    title = 'Content from Vimeo',
  } = options;

  // Handle both full URLs and just video IDs
  let vid = videoId;
  if (videoId.includes('vimeo.com')) {
    const url = new URL(videoId);
    [, vid] = url.pathname.split('/');
  }

  let suffix = '';
  const suffixParams = {
    autoplay: autoplay ? '1' : '0',
    muted: autoplay ? '1' : '0',
  };
  suffix = `?${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${vid}${suffix}" 
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      frameborder="0" 
      allow="${autoplay ? 'autoplay; ' : ''}${allowFullscreen ? 'fullscreen; ' : ''}${pictureInPicture ? 'picture-in-picture; ' : ''}" 
      ${allowFullscreen ? 'allowfullscreen' : ''} 
      title="${title}" 
      loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function createMP4Video(videoUrl, options = {}) {
  const {
    autoplay = false,
    title = 'Video Content',
  } = options;

  const video = document.createElement('video');
  video.setAttribute('controls', '');
  video.setAttribute('title', title);
  
  if (autoplay) {
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
  }

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', videoUrl);
  sourceEl.setAttribute('type', 'video/mp4');
  video.append(sourceEl);

  return video;
}

const loadVideoEmbed = (block, videoData) => {
  if (block.dataset.embedLoaded === 'true') {
    return;
  }

  const {
    videoId,
    source,
    allowFullscreen,
    pictureInPicture,
    title,
  } = videoData;

  // Determine if this is an autoplay variant
  const autoplay = source.includes('autoplay');

  let embedElement;

  // Create the appropriate embed based on source type
  if (source.startsWith('youtube')) {
    embedElement = embedYoutube(videoId, {
      autoplay,
      allowFullscreen,
      pictureInPicture,
      title,
    });
  } else if (source.startsWith('vimeo')) {
    embedElement = embedVimeo(videoId, {
      autoplay,
      allowFullscreen,
      pictureInPicture,
      title,
    });
  } else if (source.startsWith('mp4')) {
    embedElement = createMP4Video(videoId, {
      autoplay,
      title,
    });
  }

  if (embedElement) {
    block.append(embedElement);
    
    // Mark as loaded when the embed is ready
    const markAsLoaded = () => {
      block.dataset.embedLoaded = 'true';
    };

    if (embedElement.tagName === 'VIDEO') {
      embedElement.addEventListener('canplay', markAsLoaded);
    } else {
      const iframe = embedElement.querySelector('iframe');
      if (iframe) {
        iframe.addEventListener('load', markAsLoaded);
      } else {
        // Fallback if no iframe found
        setTimeout(markAsLoaded, 1000);
      }
    }
  }
};

export default async function decorate(block) {
  // Extract data from block
  const rows = [...block.children];
  block.textContent = '';
  
  // Set initial state
  block.dataset.embedLoaded = 'false';
  
  // Extract video data from rows
  const videoData = {
    videoId: '',
    source: 'vimeo', // Default source
    poster: '',
    posterAlt: '',
    posterWidth: 1600,
    posterHeight: 900,
    allowFullscreen: true,
    pictureInPicture: true,
    playButtonTitle: 'Play',
    title: 'Video Content',
  };
  
  // Parse rows to extract data
  rows.forEach((row) => {
    const [key, val] = [...row.children].map((cell) => cell.textContent.trim());
    if (key && val) {
      // Convert to camelCase
      const camelKey = key.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
      videoData[camelKey] = val;
    }
  });
  
  // Check if this is an autoplay variant
  const isAutoplay = videoData.source.includes('autoplay');
  if (isAutoplay) {
    block.classList.add('autoplay');
  }
  
  // Create placeholder if we have a poster image and it's not a no-poster variant
  const hasPoster = videoData.poster && !videoData.source.includes('no_poster');
  
  if (hasPoster) {
    block.classList.add('placeholder');
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';
    
    // Create picture element for poster
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = videoData.poster;
    img.alt = videoData.posterAlt || '';
    img.width = videoData.posterWidth;
    img.height = videoData.posterHeight;
    img.loading = 'lazy';
    picture.append(img);
    wrapper.append(picture);
    
    // Add play button if not autoplay
    if (!isAutoplay) {
      wrapper.insertAdjacentHTML(
        'beforeend',
        `<div class="video-placeholder-play"><button type="button" title="${videoData.playButtonTitle}"></button></div>`,
      );
      wrapper.addEventListener('click', () => {
        wrapper.remove();
        loadVideoEmbed(block, videoData);
      });
    }
    
    block.append(wrapper);
  }
  
  // Load video immediately if autoplay or no poster
  if (isAutoplay || !hasPoster) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        const playOnLoad = isAutoplay && !prefersReducedMotion.matches;
        if (playOnLoad || !hasPoster) {
          loadVideoEmbed(block, videoData);
        }
      }
    });
    observer.observe(block);
  }
}

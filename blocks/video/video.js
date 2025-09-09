function embedScene7(asset) {
  // Inject style if not already present
  if (!document.getElementById('s7smartcropvideo_style')) {
    const style = document.createElement('style');
    style.id = 's7smartcropvideo_style';
    style.type = 'text/css';
    style.textContent = `
      #s7smartcropvideo_div.s7smartcropvideoviewer{
        width:100%; 
        height:auto;
      }
    `;
    document.head.appendChild(style);
  }

  // Create container div
  const div = document.createElement('div');
  div.id = 's7smartcropvideo_div';

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
    document.body.appendChild(script);
  }

  // Initialize Scene7 viewer after script loads
  loadScript('https://centerparcs.scene7.com/s7viewers/html5/js/SmartCropVideoViewer.js', () => {
    window.s7smartcropvideoviewer = new window.s7viewers.SmartCropVideoViewer({
      containerId: 's7smartcropvideo_div',
      params: {
        serverurl: 'https://centerparcs.scene7.com/is/image/',
        contenturl: 'https://centerparcs.scene7.com/is/content/',
        config: 'centerparcs/Hero-5',
        videoserverurl: 'https://centerparcs.scene7.com/is/content',
        asset,
      },
    });
    window.s7smartcropvideoviewer.init();
  });

  return div;
}

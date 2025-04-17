document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('video');
    if (video) {
      setupPlayListener(video);
    }
  });
  
  // Handle dynamically loaded videos (e.g., after page navigation)
  const observer = new MutationObserver(() => {
    const video = document.querySelector('video');
    if (video && !video.dataset.playListenerAdded) {
      video.dataset.playListenerAdded = 'true';
      setupPlayListener(video);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  function setupPlayListener(video) {
    video.addEventListener('play', () => {
      
      const pauseButton = document.querySelector('.ytp-play-button');
      if (!pauseButton) {
        return;
      }
  
      if (pauseButton.dataset.isDisabled === 'true') {
        return;
      }
  
      if (!chrome.runtime || !chrome.runtime.id) {
        console.log('chrome.runtime unavailable or context invalidated; skipping pause button disable.');
        return;
      }
  
      try {
        chrome.storage.sync.get(['disableDuration'], (result) => {
          if (!chrome.runtime || !chrome.runtime.id) {
            console.log('chrome.runtime unavailable or context invalidated during storage callback; skipping.');
            return;
          }
  
          const disableDuration = (result.disableDuration || 10) * 1000; // Convert to milliseconds
          
          pauseButton.dataset.isDisabled = 'true';
          
          pauseButton.style.opacity = '0.5';
          pauseButton.style.cursor = 'not-allowed';
          
          const preventClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
          };
          pauseButton.addEventListener('click', preventClick, true);
          
          setTimeout(() => {
            if (!chrome.runtime || !chrome.runtime.id) {
              console.log('chrome.runtime unavailable or context invalidated during re-enable; skipping.');
              return;
            }
  
            pauseButton.style.opacity = '1';
            pauseButton.style.cursor = 'pointer';
            pauseButton.removeEventListener('click', preventClick, true);
            pauseButton.dataset.isDisabled = 'false';
          }, disableDuration);
        });
      } catch (error) {
        console.log('Error accessing storage:', error.message);
      }
    });
  }
document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('video');
    if (video) {
      setupPlayListener(video);
    } else {
      console.log('No video element found on this YouTube page.');
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
      console.log('YouTube video unpaused at:', new Date().toLocaleTimeString());
      
      // Find the pause button (YouTube's play/pause button has class 'ytp-play-button')
      const pauseButton = document.querySelector('.ytp-play-button');
      if (!pauseButton) {
        console.log('Pause button not found.');
        return;
      }
  
      // Check if the button is already disabled to avoid re-triggering
      if (pauseButton.dataset.isDisabled === 'true') {
        return;
      }
  
      // Check if chrome.runtime is available and context is valid
      if (!chrome.runtime || !chrome.runtime.id) {
        console.log('chrome.runtime unavailable or context invalidated; skipping pause button disable.');
        return;
      }
  
      // Get the disable duration from storage (default to 10 seconds if not set)
      try {
        chrome.storage.sync.get(['disableDuration'], (result) => {
          // Double-check chrome.runtime in the callback
          if (!chrome.runtime || !chrome.runtime.id) {
            console.log('chrome.runtime unavailable or context invalidated during storage callback; skipping.');
            return;
          }
  
          const disableDuration = (result.disableDuration || 10) * 1000; // Convert to milliseconds
          
          // Mark button as disabled
          pauseButton.dataset.isDisabled = 'true';
          
          // Visual feedback for disabled state
          pauseButton.style.opacity = '0.5';
          pauseButton.style.cursor = 'not-allowed';
          
          // Prevent click events on the pause button
          const preventClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
          };
          pauseButton.addEventListener('click', preventClick, true);
          
          // Re-enable after the specified duration
          setTimeout(() => {
            // Check chrome.runtime before modifying the button
            if (!chrome.runtime || !chrome.runtime.id) {
              console.log('chrome.runtime unavailable or context invalidated during re-enable; skipping.');
              return;
            }
  
            pauseButton.style.opacity = '1';
            pauseButton.style.cursor = 'pointer'; // Restore YouTube's default cursor
            pauseButton.removeEventListener('click', preventClick, true);
            pauseButton.dataset.isDisabled = 'false';
            console.log('Pause button re-enabled at:', new Date().toLocaleTimeString());
          }, disableDuration);
        });
      } catch (error) {
        console.log('Error accessing storage:', error.message);
      }
    });
  }
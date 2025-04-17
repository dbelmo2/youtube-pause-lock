let isLocked = false;

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
    
    // Find the pause button (YouTube's play/pause button has class 'ytp-play-button')
    const pauseButton = document.querySelector('.ytp-play-button');
    if (!pauseButton) {
      return;
    }

    if (isLocked) {
      video.pause(); // Pause the video if already locked
      return; // Ignore if already locked
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
        isLocked = true; // Lock the button to prevent re-entry
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

        video.addEventListener('click', preventClick, true);
        // Visual feedback for disabled state
        video.style.cursor = 'not-allowed';


        // Re-enable after the specified duration
        setTimeout(() => {
          // Check chrome.runtime before modifying the button
          if (!chrome.runtime || !chrome.runtime.id) {
            console.log('chrome.runtime unavailable or context invalidated during re-enable; skipping.');
            return;
          }
          isLocked = false;
          pauseButton.style.opacity = '1';
          pauseButton.style.cursor = 'pointer'; // Restore YouTube's default cursor
          pauseButton.removeEventListener('click', preventClick, true);
          if (video) {
            video.removeEventListener('click', preventClick, true);
            video.style.cursor = 'pointer';
          }
          pauseButton.dataset.isDisabled = 'false';
        }, disableDuration);
      });
    } catch (error) {
      console.log('Error accessing storage:', error.message);
    }
  });
}
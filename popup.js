document.addEventListener('DOMContentLoaded', () => {
    const durationInput = document.getElementById('durationInput');
    const saveButton = document.getElementById('saveButton');
    const statusMessage = document.getElementById('statusMessage');
  
    // Load saved duration
    chrome.storage.sync.get(['disableDuration'], (result) => {
      if (result.disableDuration) {
        durationInput.value = result.disableDuration;
      }
    });
  
    // Save duration when button is clicked
    saveButton.addEventListener('click', () => {
      const duration = parseInt(durationInput.value);
      if (duration > 0) {
        chrome.storage.sync.set({ disableDuration: duration }, () => {
          statusMessage.textContent = `Duration set to ${duration}s.`;
          statusMessage.style.visibility = 'visible'; // Show the message
          setTimeout(() => {
            statusMessage.style.visibility = 'hidden'; // Hide the message after 3 seconds
          }, 3000);
        });
      } else {
        statusMessage.textContent = 'Please enter a valid number (1 or more).';
      }
    });
  });
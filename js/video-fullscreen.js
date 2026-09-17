// Fullscreen Video Handler voor Hero Videos (Zonder geluid)
(function() {
  function setupVideoFullscreen() {
    const btn = document.getElementById('expandVideoBtn');
    const video = document.getElementById('heroVideo');
    if (!btn || !video) return;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Zorg ervoor dat het geluid altijd gemuted blijft
      video.muted = true;

      // Check cross-browser fullscreen methoden
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(err => {
          console.warn('Fullscreen error:', err);
        });
      } else if (video.webkitRequestFullscreen) { /* Safari */
        video.webkitRequestFullscreen();
      } else if (video.webkitEnterFullscreen) { /* iOS Safari video tag */
        video.webkitEnterFullscreen();
      } else if (video.msRequestFullscreen) { /* IE11 */
        video.msRequestFullscreen();
      }
    });

    // Mocht fullscreen verlaten of getriggerd worden, houd muted intact
    document.addEventListener('fullscreenchange', function() {
      video.muted = true;
    });
    document.addEventListener('webkitfullscreenchange', function() {
      video.muted = true;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupVideoFullscreen);
  } else {
    setupVideoFullscreen();
  }
})();

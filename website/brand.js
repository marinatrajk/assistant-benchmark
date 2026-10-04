'use strict';

(() => {
  const video = document.querySelector('.brand-video');
  if (!video) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const shouldPlay = () => !reducedMotion.matches && !document.hidden;
  const updatePlayback = () => {
    if (!shouldPlay()) {
      video.pause();
      video.hidden = true;
      return;
    }

    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.muted = true;
    video.play().catch(() => { video.hidden = true; });
  };

  video.addEventListener('playing', () => {
    video.hidden = !shouldPlay();
    if (!shouldPlay()) video.pause();
  });
  video.addEventListener('error', () => { video.hidden = true; });
  reducedMotion.addEventListener('change', updatePlayback);
  document.addEventListener('visibilitychange', updatePlayback);
  updatePlayback();
})();

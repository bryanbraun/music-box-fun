import { musicBoxStore } from '../music-box-store.js';
import { sampler } from './sampler.js';
import { getContext } from '../vendor/tone.js';

// We had to go with the revealing module pattern here. I tried a plain
// object but our scroll event handler required us to use bind(). Unfortunately,
// bind() returns an anonymous function and we can't remove event handlers
// of anonymous functions (see https://stackoverflow.com/a/3120623/1154642)
export const playheadObserver = (function () {
  let userHasScrolled = false;
  let playheadPosition;
  let observer;
  let audioContext = getContext();

  function confirmInitialScroll() {
    userHasScrolled = true;
    window.removeEventListener('scroll', confirmInitialScroll);
  }

  function isAtPlayhead(entry) {
    const comparisonBuffer = 10;
    const holeWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hole-width').trim());
    const noteCenterPosition = entry.boundingClientRect.top + (holeWidth / 2);

    return Math.abs(noteCenterPosition - playheadPosition) < comparisonBuffer;
  }

  function intersectionHandler(entries) {
    entries.forEach(entry => {
      // Prevent notes positioned under the playhead during page load from playing.
      if (!userHasScrolled) {
        return;
      }

      // Exit early if we are in ToneJS playing mode
      if (musicBoxStore.state.appState.isPlaying) {
        return;
      }

      // Exit early if the audio context has been disabled by the browser.
      if (audioContext.state !== 'running') {
        if (musicBoxStore.state.appState.audioDisabledMessageStatus === 'hidden') {
          musicBoxStore.setState('appState.audioDisabledMessageStatus', 'alerting');
        }
        return;
      }

      // Reject events firing for notes that aren't at the playhead.
      if (!isAtPlayhead(entry)) {
        return;
      }

      // Reject events firing for "silent" (red) notes
      if (entry.target.classList.contains('silent')) {
        return;
      }

      sampler.triggerAttackRelease(entry.target.parentElement.id, '8n');
    });
  }

  function setup() {
    // We get the playhead position by querying the playhead directly (instead of looking
    // up the CSS variable) because the variable uses calc which makes it difficult to
    // query. See https://stackoverflow.com/q/56229772/1154642.
    playheadPosition = document.querySelector('.music-box__playhead').getBoundingClientRect().top;

    const options = {
      root: null,
      rootMargin: `-${playheadPosition}px 0px 0px 0px`,
      threshold: 0.5, // trigger event when 50% of the note crosses the threshold.
    }
    window.addEventListener('scroll', confirmInitialScroll);

    observer = new IntersectionObserver(intersectionHandler, options);
  }

  function get() {
    return observer;
  }

  return {
    setup,
    get,
  }
})();

import { musicBoxStore } from '../music-box-store.js';
import { sampler, isSamplerLoaded } from './sampler.js';
import { getContext } from '../vendor/tone.js';
import { debounce } from '../utils/debounce.js';
import { PLAYHEAD_TO_VIEWPORT_TOP } from './constants.js';

const INTERMISSION_TIME = 50; // in milliseconds
const audioContext = getContext();

function isAtPlayhead(entry) {
  const comparisonBuffer = 10; // determined by testing
  const holeWidth = parseInt(getComputedStyle(document.body).getPropertyValue('--hole-width').trim());
  const noteCenterToViewportTop = entry.boundingClientRect.top + (holeWidth / 2);

  return Math.abs(noteCenterToViewportTop - PLAYHEAD_TO_VIEWPORT_TOP) < comparisonBuffer;
}

export const playheadObserver = {
  observer: null,
  isInIntermission: false,

  endIntermissionAfterDelay: debounce((thisPlayHeadObserver) => {
    thisPlayHeadObserver.isInIntermission = false;
  }, INTERMISSION_TIME),


  intersectionHandler(entries) {
    entries.forEach(entry => {
      if (this.isInIntermission) {
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
      if (entry.target.classList.contains('is-silent')) {
        return;
      }

      // TRIGGER VISUAL FLASH
      entry.target.classList.add("is-active");
      void entry.target.offsetWidth; // See: https://css-tricks.com/restart-css-animation/
      entry.target.classList.remove("is-active");

      // Exit before triggering a sound, if we are in ToneJS playing mode
      if (musicBoxStore.state.appState.isPlaying) {
        return;
      }

      // TRIGGER SOUND
      isSamplerLoaded && sampler.triggerAttackRelease(entry.target.parentElement.id, '8n');
    });
  },

  // When we observe a note, the callback is triggered immediately by default (see
  // https://stackoverflow.com/a/53385264/1154642). This was causing notes under the playhead
  // to play whenever their note line was re-rendered (like during page load, song change, or
  // note selection). To prevent this, we observe notes with this function, which defines an
  // intermission period during which we don't play sounds.
  observeWithIntermission(element) {
    if (!this.isInIntermission) {
      this.isInIntermission = true;
    }

    this.endIntermissionAfterDelay(this);

    this.observer.observe(element);
  },

  setup() {
    const options = {
      root: null,
      rootMargin: `-${PLAYHEAD_TO_VIEWPORT_TOP}px 0px 0px 0px`,
      threshold: 0.5, // trigger event when 50% of the note crosses the threshold.
    }

    this.observer = new IntersectionObserver(this.intersectionHandler.bind(this), options);
  },
};

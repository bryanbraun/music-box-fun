import { musicBoxStore } from '../music-box-store.js';
import { sampler, isSamplerLoaded } from './sampler.js';
import { getContext } from '../vendor/tone.js';
import { debounce } from '../utils/debounce.js';

const INTERMISSION_TIME = 50; // in milliseconds

export const playheadObserver = {
  playheadPosition: null,
  observer: null,
  isInIntermission: false,
  endIntermissionAfterDelay: null,
  audioContext: getContext(),

  isAtPlayhead(entry) {
    const comparisonBuffer = 10;
    const holeWidth = parseInt(getComputedStyle(document.body).getPropertyValue('--hole-width').trim());
    const noteCenterPosition = entry.boundingClientRect.top + (holeWidth / 2); // @TODO: can I refactor this out now that we use CSS to adjust note centers?

    return Math.abs(noteCenterPosition - this.playheadPosition) < comparisonBuffer;
  },

  intersectionHandler(entries) {
    entries.forEach(entry => {
      if (this.isInIntermission) {
        return;
      }

      // Exit early if the audio context has been disabled by the browser.
      if (this.audioContext.state !== 'running') {
        if (musicBoxStore.state.appState.audioDisabledMessageStatus === 'hidden') {
          musicBoxStore.setState('appState.audioDisabledMessageStatus', 'alerting');
        }
        return;
      }

      // Reject events firing for notes that aren't at the playhead.
      if (!this.isAtPlayhead(entry)) {
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

    this.endIntermissionAfterDelay();

    this.observer.observe(element);
  },

  setup() {
    // We assign this method in setup because the 'this' that our debounce function needs isn't
    // available during object definition (see https://stackoverflow.com/a/13441344/1154642).
    this.endIntermissionAfterDelay = debounce(function () {
      this.isInIntermission = false;
    }.bind(this), INTERMISSION_TIME);

    // We get the playhead position by querying the playhead directly (instead of looking
    // up the CSS variable) because the variable uses calc which makes it difficult to
    // query. See https://stackoverflow.com/q/56229772/1154642.
    this.playheadPosition = document.querySelector('.music-box__playhead').getBoundingClientRect().top;

    const options = {
      root: null,
      rootMargin: `-${this.playheadPosition}px 0px 0px 0px`,
      threshold: 0.5, // trigger event when 50% of the note crosses the threshold.
    }

    this.observer = new IntersectionObserver(this.intersectionHandler.bind(this), options);
  },
};

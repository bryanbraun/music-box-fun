import { musicBoxStore } from '../music-box-store.js';
import { getContext } from '../vendor/tone.js';

let audioContext = getContext();

function setupAudioContextFallbackForRestrictiveBrowsers() {
  document.addEventListener('click', event => {
    if (audioContext.state !== 'running') {
      audioContext.resume();

      if (musicBoxStore.state.appState.isAudioDisabledMessageVisible &&
        !musicBoxStore.state.appState.isAudioDisabledMessageResolved) {
        musicBoxStore.setState('appState.isAudioDisabledMessageResolved', true);
      }
    }
  }, true);
}

export {
  setupAudioContextFallbackForRestrictiveBrowsers,
}

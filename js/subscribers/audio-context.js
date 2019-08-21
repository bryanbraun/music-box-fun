import { musicBoxStore } from '../music-box-store.js';

function setupAudioContextFallbackForRestrictiveBrowsers() {
  document.addEventListener('click', event => {
    if (Tone.context.state !== 'running') {
      Tone.context.resume();

      if (musicBoxStore.state.appState.isAudioDisabledMessageVisible &&
        !musicBoxStore.state.appState.isAudioDisabledMessageResolved) {
        musicBoxStore.dispatch('resolveAudioDisabledMessage', true);
      }
    }
  });
}

export {
  setupAudioContextFallbackForRestrictiveBrowsers,
}

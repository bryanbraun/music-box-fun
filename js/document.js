import { musicBoxStore } from './music-box-store.js';

function setupKeyboardEvents() {
  document.addEventListener('keydown', event => {
    const isInsideTextInput = (event.target.tagName === 'INPUT');
    if (!isInsideTextInput && event.keyCode === 32) {
      event.preventDefault(); // Prevent default space bar page scroll.
      musicBoxStore.dispatch('toggleScrolling', !musicBoxStore.state.appState.isScrolling);
    }
  });
}

function enableAudioContextForRestrictiveBrowsers() {
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
  setupKeyboardEvents,
  enableAudioContextForRestrictiveBrowsers,
}

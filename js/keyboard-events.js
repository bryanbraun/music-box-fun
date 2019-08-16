import { musicBoxStore } from './music-box-store.js';

export function setupKeyboardEvents() {
  document.addEventListener('keydown', event => {
    const isInsideTextInput = (event.target.tagName === 'INPUT');
    if (!isInsideTextInput && event.keyCode === 32) {
      event.preventDefault(); // Prevent default space bar page scroll.
      musicBoxStore.dispatch('toggleScrolling', !musicBoxStore.state.appState.isScrolling);
    }
  });
}

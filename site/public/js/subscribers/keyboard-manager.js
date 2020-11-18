import { musicBoxStore } from '../music-box-store.js';

function setupKeyboardEvents() {
  document.addEventListener('keydown', event => {
    const isInsideTextInput = event.target.tagName === 'INPUT' &&
                              event.target.attributes &&
                              event.target.attributes.type &&
                              (event.target.attributes.type.value === 'text' || event.target.attributes.type.value === 'search');

    // SPACE (for play/pause)
    if (!isInsideTextInput && event.keyCode === 32) {
      event.preventDefault(); // Prevent default space bar page scroll.
      musicBoxStore.setState('appState.isPlaying', !musicBoxStore.state.appState.isPlaying);
    }
    // ESC (for closing off-canvas navs)
    else if (event.keyCode === 27 && musicBoxStore.state.appState.offCanvasSidebarFocused !== 'none') {
      musicBoxStore.setState('appState.offCanvasSidebarFocused', 'none');
    }
  });
}

export {
  setupKeyboardEvents,
}

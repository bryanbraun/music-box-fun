import { musicBoxStore } from '../music-box-store.js';

function setupKeyboardEvents() {
  document.addEventListener('keydown', event => {
    const isInsideTextInput = event.target.tagName === 'INPUT' &&
                              event.target.attributes &&
                              event.target.attributes.type &&
                              (event.target.attributes.type.value === 'text' || event.target.attributes.type.value === 'search');

    if (isInsideTextInput) return;

    switch (event.key) {
      case " ":
        event.preventDefault(); // Prevent default space bar page scroll.
        musicBoxStore.setState('appState.isPlaying', !musicBoxStore.state.appState.isPlaying);
        break;
      case "z":
        const isMacUndo = event.metaKey && !event.shiftKey;
        const isMacRedo = event.metaKey && event.shiftKey;
        const isWindowsUndo = event.ctrlKey && !event.shiftKey;
        const isWindowsRedo = event.ctrlKey && event.shiftKey;

        if (isMacUndo || isWindowsUndo) {
          event.preventDefault();
          history.back();
        }
        if (isMacRedo || isWindowsRedo) {
          event.preventDefault();
          history.forward();
        }
        break;
      case "Escape":
        if (musicBoxStore.state.appState.offCanvasSidebarFocused !== 'none') {
          musicBoxStore.setState('appState.offCanvasSidebarFocused', 'none');
        }
        break;
      default:
        return;
    }
  });
}

export {
  setupKeyboardEvents,
}

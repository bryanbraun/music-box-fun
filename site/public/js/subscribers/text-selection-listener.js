import { musicBoxStore } from '../music-box-store.js';

export function setupTextSelectionListener() {
  document.addEventListener('selectstart', (event) => {
    // This code exists because sometimes the UX can be improved by disabling
    // text selection, like during dragging interactions.
    if (!musicBoxStore.state.appState.isTextSelectionEnabled) {
      document.getSelection().removeAllRanges(); // deselect any existing text
      event.preventDefault(); // prevent selection of new text
    }
  });
}

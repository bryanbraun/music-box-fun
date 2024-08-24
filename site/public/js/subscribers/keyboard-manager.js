import { musicBoxStore } from '../music-box-store.js';
import { hasSelectedNotes, getFinalNoteYPos } from '../common/notes.js';
import { cloneDeep } from '../utils/clone.js';
import { NOTE_STARTING_THRESHOLD } from '../common/constants.js';
import { resizePaperIfNeeded } from '../common/pages.js';
import { snapToNextInterval, snapToPreviousInterval } from '../common/snap-to-interval.js';

function setupKeyboardEvents() {
  document.addEventListener('keydown', event => {
    const isInsideTextInput = event.target.tagName === 'INPUT' &&
      event.target.attributes &&
      event.target.attributes.type &&
      (event.target.attributes.type.value === 'text' || event.target.attributes.type.value === 'search');

    if (isInsideTextInput) return;

    switch (event.key) {
      case " ": {
        event.preventDefault(); // Prevent default space bar page scroll.
        musicBoxStore.setState('appState.isPlaying', !musicBoxStore.state.appState.isPlaying);
        break;
      }
      case "z": {
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
      }
      case "Escape": {
        if (musicBoxStore.state.appState.offCanvasSidebarFocused !== 'none') {
          musicBoxStore.setState('appState.offCanvasSidebarFocused', 'none');
        }
        break;
      }
      case "ArrowUp": {
        if (!hasSelectedNotes()) return; // only nudge if there are selected notes.
        event.preventDefault(); // nudge selected notes instead of scrolling the page.
        nudgeSelectedNotes("up", event);

        break;
      }
      case "ArrowDown": {
        if (!hasSelectedNotes()) return; // only nudge if there are selected notes.
        event.preventDefault(); // nudge selected notes instead of scrolling the page.
        nudgeSelectedNotes("down", event);

        break;
      }
      case "Backspace": {
        if (!hasSelectedNotes()) return;

        let updatedSongData = cloneDeep(musicBoxStore.state.songState.songData);

        Object.keys(musicBoxStore.state.appState.selectedNotes).forEach(pitchId => {
          updatedSongData[pitchId] = updatedSongData[pitchId].filter(noteYPos => {
            return !musicBoxStore.state.appState.selectedNotes[pitchId].includes(noteYPos);
          });
        });

        musicBoxStore.setState('songState.songData', updatedSongData);
        break;
      }
      default: {
        return;
      }
    }
  });


  function nudgeSelectedNotes(direction, event) {
    let pixelAmount = null;
    let snapToDirectionalInterval = null

    switch (direction) {
      case "up": {
        pixelAmount = -1;
        snapToDirectionalInterval = snapToPreviousInterval;
        break;
      }
      case "down": {
        pixelAmount = 1;
        snapToDirectionalInterval = snapToNextInterval;
        break;
      }
    }

    let updatedSongData = cloneDeep(musicBoxStore.state.songState.songData);
    let updatedSelectedNotes = cloneDeep(musicBoxStore.state.appState.selectedNotes);

    Object.keys(musicBoxStore.state.appState.selectedNotes).forEach(pitchId => {
      // Delete selected notes from songData.
      updatedSongData[pitchId] = updatedSongData[pitchId].filter(noteYPos => {
        return !musicBoxStore.state.appState.selectedNotes[pitchId].includes(noteYPos);
      });

      // Move selected notes. Math.max prevents notes from moving above the starting threshold.
      updatedSelectedNotes[pitchId] = updatedSelectedNotes[pitchId].map(noteYPos => {
        const newNoteYPos = snapToDirectionalInterval(noteYPos + pixelAmount, event);
        return Math.max(NOTE_STARTING_THRESHOLD, newNoteYPos);
      });

      // Add selected notes back into songData
      updatedSongData[pitchId] = updatedSongData[pitchId].concat(updatedSelectedNotes[pitchId]).sort((a, b) => a - b);
      updatedSongData[pitchId] = Array.from(new Set(updatedSongData[pitchId])); // Dedupe notes

      // Set state for this pitch. Note: By setting musicBoxStore.state.appState.selectedNotes
      // directly (instead of calling setState) we update that state without triggering any
      // re-renders. This is usually not what we want, but in this case we do it because we
      // know the note line will be re-rendered in the next line of code, and we don't want to
      // trigger double-renders for no reason.
      musicBoxStore.state.appState.selectedNotes[pitchId] = updatedSelectedNotes[pitchId];
      musicBoxStore.setState(`songState.songData.${pitchId}`, updatedSongData[pitchId]);

      // Update the number of pages, if needed.
      resizePaperIfNeeded(getFinalNoteYPos());
    });
  }
}

export {
  setupKeyboardEvents,
}

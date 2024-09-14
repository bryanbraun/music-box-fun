import { musicBoxStore } from '../music-box-store.js';
import { hasSelectedNotes, getFinalNoteYPos } from '../common/notes.js';
import { cloneDeep } from '../utils/clone.js';
import { NOTE_LINE_STARTING_GAP } from '../constants.js';
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

        // Prevent song from playing if the user is actively dragging notes.
        if (musicBoxStore.state.appState.selectedNotesDragStartPos !== null) return;

        musicBoxStore.setState('appState.isPlaying', !musicBoxStore.state.appState.isPlaying);
        break;
      }
      case "a": {
        event.preventDefault(); // Prevent browser from selecting all text on the page.

        const isMacSelectAll = event.metaKey;
        const isWindowsSelectAll = event.ctrlKey;

        if (isMacSelectAll || isWindowsSelectAll) {
          musicBoxStore.setState('appState.selectedNotes', cloneDeep(musicBoxStore.state.songState.songData));
        }

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
        if (!hasSelectedNotes()) return;
        event.preventDefault(); // don't scroll the page
        nudgeSelectedNotes("up", event);

        break;
      }
      case "ArrowDown": {
        if (!hasSelectedNotes()) return;
        event.preventDefault(); // don't scroll the page
        nudgeSelectedNotes("down", event);

        break;
      }
      case "Backspace": {
        if (!hasSelectedNotes()) return;

        Object.entries(musicBoxStore.state.appState.selectedNotes).forEach(([pitchId, selectedNotesArray]) => {
          const updatedNotesArray = musicBoxStore.state.songState.songData[pitchId].filter(noteYPos => {
            return !selectedNotesArray.includes(noteYPos);
          });

          // Reset selected notes. By setting musicBoxStore.state.appState.selectedNotes[pitchId]
          // directly (instead of calling setState) we update that state without triggering any
          // re-renders. This is usually not what we want, but in this case we do it because we
          // know the note line will be re-rendered in the following line of code, and we don't
          // want to trigger double-renders for no reason.
          musicBoxStore.state.appState.selectedNotes[pitchId] = [];
          musicBoxStore.setState(`songState.songData.${pitchId}`, updatedNotesArray);
        });

        break;
      }
      default: {
        return;
      }
    }
  });

  function isTryingToNudgeSelectedNoteAboveThreshold(direction) {
    return Object.values(musicBoxStore.state.appState.selectedNotes).some((selectedNotesArray) => {
      return direction === "up" && selectedNotesArray.some((yPos) => yPos === NOTE_LINE_STARTING_GAP);
    });
  }

  function nudgeSelectedNotes(direction, event) {
    if (isTryingToNudgeSelectedNoteAboveThreshold(direction)) return;

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
      // Delete selected notes from songData. Uses splice to avoid over-deleting duplicate notes.
      updatedSelectedNotes[pitchId].forEach(selectedNoteYPos => {
        const noteToDeleteIndex = updatedSongData[pitchId].findIndex(noteYPos => noteYPos === selectedNoteYPos);
        if (noteToDeleteIndex !== -1) {
          updatedSongData[pitchId].splice(noteToDeleteIndex, 1);
        }
      });

      // Move selected notes.
      updatedSelectedNotes[pitchId] = updatedSelectedNotes[pitchId].map(noteYPos => {
        return snapToDirectionalInterval(noteYPos + pixelAmount, event);
      });

      // Add selected notes back into songData
      updatedSongData[pitchId] = updatedSongData[pitchId].concat(updatedSelectedNotes[pitchId]).sort((a, b) => a - b);

      // Set state for this pitch. By setting musicBoxStore.state.appState.selectedNotes[pitchId]
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

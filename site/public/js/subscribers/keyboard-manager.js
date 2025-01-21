import { musicBoxStore } from '../music-box-store.js';
import { cloneDeep } from '../utils.js';
import { NOTE_LINE_STARTING_GAP, PLAYHEAD_TO_VIEWPORT_TOP } from '../constants.js';
import { resizePaperIfNeeded } from '../common/pages.js';
import { boxTypePitches, getCurrentBoxType } from '../common/box-types.js';
import { snapToNextInterval, snapToPreviousInterval } from '../common/snap-to-interval.js';
import { confirmationDialog } from '../common/confirmation-dialog.js';
import { hasSelectedNotes, isNotesClipboardEmpty, getFinalNoteYPos, cloneExistingNotesOnly, setSelectedNotesAndSongDataState, getNotesCount } from '../common/notes.js';

function setupKeyboardEvents() {
  document.addEventListener('keydown', async event => {
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
      case "c": {
        const isMacCopy = event.metaKey;
        const isWindowsCopy = event.ctrlKey;

        if (isMacCopy || isWindowsCopy) {
          if (!hasSelectedNotes()) return;
          event.preventDefault();

          const copiedNotes = cloneExistingNotesOnly(musicBoxStore.state.appState.selectedNotes);
          const s = getNotesCount(copiedNotes) === 1 ? '' : 's';
          musicBoxStore.setState('appState.notesClipboard', copiedNotes);
          musicBoxStore.publish('OverlayMessage', `${getNotesCount(copiedNotes)} note${s} copied to clipboard`);
        }
        break;
      }
      case "x": {
        const isMacCut = event.metaKey;
        const isWindowsCut = event.ctrlKey;

        if (isMacCut || isWindowsCut) {
          if (!hasSelectedNotes()) return;
          event.preventDefault();

          const cutNotes = cloneExistingNotesOnly(musicBoxStore.state.appState.selectedNotes);
          const s = getNotesCount(cutNotes) === 1 ? '' : 's';
          musicBoxStore.setState('appState.notesClipboard', cutNotes);
          deleteSelectedNotesAndUpdateState();
          musicBoxStore.publish('OverlayMessage', `${getNotesCount(cutNotes)} note${s} cut and added to clipboard`);
        }
        break;
      }
      case "√": //  This is the event.key for "⌥ + v" on mac
      case "v": {
        const isMacPaste = event.metaKey;
        const isWindowsPaste = event.ctrlKey;

        if (isMacPaste || isWindowsPaste) {
          if (isNotesClipboardEmpty()) return;
          event.preventDefault();

          const currentBoxType = getCurrentBoxType();
          const clipboardNotes = musicBoxStore.state.appState.notesClipboard;
          const isClipboardContainingUnsupportedNotes = Object.keys(clipboardNotes).some(pitchId => {
            return !boxTypePitches[currentBoxType].includes(pitchId);
          });
          if (isClipboardContainingUnsupportedNotes) {
            try {
              await confirmationDialog('Some of your copied notes cannot be pasted because this music box supports different pitches. Do you want to continue?');
            } catch (error) {
              return;
            }
          }

          const firstClipboardNoteYPos = Object.values(clipboardNotes).reduce((accumulator, currentValue) => {
            return Math.min(accumulator, Math.min(...currentValue));
          }, Infinity);

          const songTopToViewportTop = document.querySelector('#note-lines').getBoundingClientRect().top;
          const relativePlayHeadPosition = PLAYHEAD_TO_VIEWPORT_TOP - songTopToViewportTop;
          const pastedNotesStartingYPos = snapToNextInterval(relativePlayHeadPosition, event);
          const pasteDistanceDifference = pastedNotesStartingYPos - firstClipboardNoteYPos;
          let pasteCount = 0;

          Object.entries(clipboardNotes).forEach(([pitchId, clipboardPitchArray]) => {
            // Skip pitch if the current music box doesn't support it.
            if (!boxTypePitches[currentBoxType].includes(pitchId)) return;

            // Dedupe data before pasting, to prevent excessive duplicate stacking via repeated pasting.
            const dedupedSongDataArray = Array.from(new Set(musicBoxStore.state.songState.songData[pitchId]));
            const pastedNotesArray = clipboardPitchArray.map(noteYPos => noteYPos + pasteDistanceDifference);
            const finalNotesArray = dedupedSongDataArray.concat(pastedNotesArray).sort((a, b) => a - b);
            pasteCount += pastedNotesArray.length;

            setSelectedNotesAndSongDataState(pitchId, pastedNotesArray, finalNotesArray);
          });

          const message = (pasteCount === 1) ? '1 note pasted (click & drag to move it)'
            : `${pasteCount} notes pasted (click & drag to move them)`;

          musicBoxStore.publish('OverlayMessage', message);

          resizePaperIfNeeded(getFinalNoteYPos());
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

        deleteSelectedNotesAndUpdateState();

        break;
      }
      default: {
        return;
      }
    }
  });
}

// SUPPORTING FUNCTIONS

function deleteSelectedNotesAndUpdateState() {
  Object.entries(musicBoxStore.state.appState.selectedNotes).forEach(([pitchId, selectedNotesArray]) => {
    const updatedSelectedNotesArray = [];
    const updatedNotesArray = musicBoxStore.state.songState.songData[pitchId].filter(noteYPos => {
      return !selectedNotesArray.includes(noteYPos);
    });

    setSelectedNotesAndSongDataState(pitchId, updatedSelectedNotesArray, updatedNotesArray);
  });
}

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

  Object.entries(musicBoxStore.state.appState.selectedNotes).forEach(([pitchId, selectedNotesArray]) => {
    let updatedNotesArray = [...musicBoxStore.state.songState.songData[pitchId]];

    // Delete selected notes from notesArray.
    // Using splice ensures we only delete the first instance of a note (useful if there are duplicate notes).
    selectedNotesArray.forEach(selectedNoteYPos => {
      const noteToDeleteIndex = updatedNotesArray.findIndex(noteYPos => noteYPos === selectedNoteYPos);
      if (noteToDeleteIndex !== -1) {
        updatedNotesArray.splice(noteToDeleteIndex, 1);
      }
    });

    // Move selected notes.
    const updatedSelectedNotesArray = selectedNotesArray.map(noteYPos => {
      return snapToDirectionalInterval(noteYPos + pixelAmount, event);
    });

    // Add selected notes back into notesArray.
    updatedNotesArray = updatedNotesArray.concat(updatedSelectedNotesArray).sort((a, b) => a - b);

    setSelectedNotesAndSongDataState(pitchId, updatedSelectedNotesArray, updatedNotesArray);
  });

  // Update the number of pages, if needed.
  resizePaperIfNeeded(getFinalNoteYPos());
}

export {
  setupKeyboardEvents,
}

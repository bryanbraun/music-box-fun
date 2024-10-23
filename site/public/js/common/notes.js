import { QUARTER_BAR_GAP } from '../constants.js';
import { musicBoxStore } from '../music-box-store.js';

// The "dead zone" is the region after a note, wherein if a note is placed, it
// will display as red and will not play a note (due to mechanical limitations).
// We estimate the value of this length from testing on real music boxes. The
// dead-zone should be the same for all music boxes and hole-sizes.
const DEAD_ZONE_LENGTH = QUARTER_BAR_GAP - 9;

/**
 * A specialized forEach function that loops over a notesArray, and provides the
 * position of the note, and whether it is silent (or not). These are the params:
 *
 *  - yPos (Number) : The stored value of the note.
 *  - isSilent (Boolean) : Whether the note is silent or not.
 *
 * This is useful because silent notes are treated differently at different places
 * in the code (ex: the UI displays them as red, but ToneJS omits them entirely).
 */
export function forEachNotes(notesArray, callback) {
  let lastPlayableNoteYPos = 0;

  notesArray.forEach((yPos, i) => {
    const gapToLastPlayableNote = yPos - lastPlayableNoteYPos;
    const isNotePlayable = (i === 0) || (gapToLastPlayableNote === 0) || (gapToLastPlayableNote > DEAD_ZONE_LENGTH);
    lastPlayableNoteYPos = isNotePlayable ? yPos : lastPlayableNoteYPos;

    const isSilent = !isNotePlayable;

    callback(yPos, isSilent, i);
  });
}

export function isSilentNotePresentInSong() {
  return Object.values(musicBoxStore.state.songState.songData).some(notesArray => {
    let lastPlayableNoteYPos = 0;

    return notesArray.some((yPos, i) => {
      const gapToLastPlayableNote = yPos - lastPlayableNoteYPos;
      const isNotePlayable = (i === 0) || (gapToLastPlayableNote === 0) || (gapToLastPlayableNote > DEAD_ZONE_LENGTH);
      lastPlayableNoteYPos = isNotePlayable ? yPos : lastPlayableNoteYPos;

      return !isNotePlayable;
    });
  });
}

// Used to determine if a given position in a noteArray will be silent or not.
export function isNotePositionSilent(yPosToCheck, notesArray) {
  const testArray = [...notesArray, yPosToCheck].sort((a, b) => Number(a) - Number(b));

  let isPositionToCheckSilent = false;
  let lastPlayableNoteYPos = 0;

  // We must check all prior notes to determine if the note is silent, after which we can exit.
  for (let i = 0; i < testArray.length; i++) {
    let currentYPos = testArray[i];
    const gapToLastPlayableNote = currentYPos - lastPlayableNoteYPos;
    const isNotePlayable = (i === 0) || (gapToLastPlayableNote === 0) || (gapToLastPlayableNote > DEAD_ZONE_LENGTH);

    if (currentYPos === yPosToCheck) {
      isPositionToCheckSilent = !isNotePlayable;
      break;
    }

    lastPlayableNoteYPos = isNotePlayable ? currentYPos : lastPlayableNoteYPos;
  }

  return isPositionToCheckSilent;
}

export function getFinalNoteYPos(songData) {
  const songDataToCheck = songData || musicBoxStore.state.songState.songData;
  return Object.values(songDataToCheck).reduce((accumulator, currentValue) => {
    return Math.max(accumulator, Math.max(...currentValue));
  }, 0);
}

export function getNoteYPos(element) {
  const yposMatch = element.style.transform.match(/translateY\((\d+\.?\d*)px\)/); // https://regex101.com/r/49U5Dx/1
  return (yposMatch && yposMatch[1]) ? parseInt(yposMatch[1]) : console.error("Couldn't find note position");
};

function hasAnyNotes(notesObject) {
  return Object.values(notesObject).some(notesArray => notesArray.length > 0);
}

export function hasSelectedNotes() {
  return hasAnyNotes(musicBoxStore.state.appState.selectedNotes);
};

export function isNotesClipboardEmpty() {
  return !hasAnyNotes(musicBoxStore.state.appState.notesClipboard);
};

// Return a copy of the notesObject with all notes removed.
export function clearAllExistingNotes(notesObject) {
  const clearedNotesObject = {};

  Object.keys(notesObject).forEach(pitchId => {
    clearedNotesObject[pitchId] = [];
  });

  return clearedNotesObject;
}

// Return a copy of the notesObject with populated pitches only.
export function cloneExistingNotesOnly(notesObject) {
  const clonedNotesObject = {};

  Object.entries(notesObject).forEach(([pitchId, notesArray]) => {
    if (notesArray.length > 0) {
      clonedNotesObject[pitchId] = [...notesArray];
    }
  });

  return clonedNotesObject;

}

// Return a copy of songData with all notes deduped and sorted. This
// is useful when we want to save a bunch of note changes at once.
export function dedupeAndSortSongData(songData) {
  const dedupedAndSortedSongData = {};

  Object.keys(songData).forEach((pitchId) => {
    const dedupedNotesArray = Array.from(new Set(songData[pitchId]));
    dedupedAndSortedSongData[pitchId] = dedupedNotesArray.sort((a, b) => a - b);
  });

  return dedupedAndSortedSongData;
}

// Set the selectedNotes and songData for a specific pitch.
//
// We have a special function for this because we're doing some performance optimizations.
// By setting musicBoxStore.state.appState.selectedNotes[pitchId] directly (instead of
// calling setState) we update that state without triggering any re-renders. This is
// usually an anti-pattern, but in this case we do it because we know the note line will
// be re-rendered in the next line of code, and we don't want to trigger double-renders
// for no reason.
export function setSelectedNotesAndSongDataState(pitchId, updatedSelectedNotes, updatedSongData) {
  musicBoxStore.state.appState.selectedNotes[pitchId] = updatedSelectedNotes;
  musicBoxStore.setState(`songState.songData.${pitchId}`, updatedSongData);
}

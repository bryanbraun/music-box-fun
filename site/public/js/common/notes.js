import { QUARTER_BAR_GAP } from './constants.js';
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
    const isNotePlayable = (i === 0) ? true : (yPos - lastPlayableNoteYPos > DEAD_ZONE_LENGTH);
    lastPlayableNoteYPos = isNotePlayable ? yPos : lastPlayableNoteYPos;

    const isSilent = !isNotePlayable;

    callback(yPos, isSilent, i);
  });
}

// A "computed" function that returns true if a silent note is present in the song
// (and false, if not).
export function isSilentNotePresentInSong() {
  return Object.keys(musicBoxStore.state.songState.songData).some(pitchId => {
    let notesArray = musicBoxStore.state.songState.songData[pitchId];
    let lastPlayableNoteYPos = 0;

    for (let i = 0; i < notesArray.length; i++) {
      let yPos = notesArray[i];
      let isNotePlayable = (i === 0) ? true : (yPos - lastPlayableNoteYPos > DEAD_ZONE_LENGTH);
      lastPlayableNoteYPos = isNotePlayable ? yPos : lastPlayableNoteYPos;

      if (!isNotePlayable) return true;
    }
  })
}

// Used to determine if a given position in a noteArray will be silent or not.
export function isNotePositionSilent(yPosToCheck, notesArray) {
  const testArray = [...notesArray, yPosToCheck].sort((a, b) => Number(a) - Number(b));

  let isPositionToCheckSilent = false;
  let lastPlayableNoteYPos = 0;

  // We must check all prior notes to determine if the note is silent, after which we can exit.
  for (let i = 0; i < testArray.length; i++) {
    let currentYPos = testArray[i];
    let isNotePlayable = (i === 0) ? true : (currentYPos - lastPlayableNoteYPos > DEAD_ZONE_LENGTH);

    if (currentYPos === yPosToCheck) {
      isPositionToCheckSilent = !isNotePlayable;
      break;
    }

    lastPlayableNoteYPos = isNotePlayable ? currentYPos : lastPlayableNoteYPos;
  }

  return isPositionToCheckSilent;
}

export function getFinalNoteYPos() {
  return Object.values(musicBoxStore.state.songState.songData).reduce((accumulator, currentValue) => {
    return Math.max(accumulator, Math.max(...currentValue));
  }, 0);
}

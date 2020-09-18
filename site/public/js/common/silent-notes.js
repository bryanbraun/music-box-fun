import { QUARTER_BAR_GAP, STANDARD_HOLE_RADIUS } from '../common/constants.js';
import { musicBoxStore } from '../music-box-store.js';

// The "dead zone" is the region after a note, wherein if a note is placed, it
// will display as red and will not play a note (due to mechanical limitations).
// We base this length on the actual boxes, and the STANDARD_HOLE_RADIUS to ensure
// the dead-zone is the same when we use different hole-sizes.
const DEAD_ZONE_LENGTH = QUARTER_BAR_GAP - STANDARD_HOLE_RADIUS - 1;

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

    callback(yPos, isSilent);
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

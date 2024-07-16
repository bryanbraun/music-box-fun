import { EIGHTH_BAR_GAP, QUARTER_BAR_GAP, SIXTEENTH_BAR_GAP, NOTE_LINE_STARTING_GAP } from './constants.js';
import { musicBoxStore } from '../music-box-store.js';

const snapToIntervals = {
  'none': 0,
  'grid': EIGHTH_BAR_GAP,
  '16ths': SIXTEENTH_BAR_GAP,
  '¼ triplet': (2 * QUARTER_BAR_GAP) / 3,
  '⅛ triplet': (2 * EIGHTH_BAR_GAP) / 3,
};

// Snaps a cursor position to the currently selected snap-to interval.
// (the mouseEvent parameter is optional, and is used to disable snapping when alt is held down)
export function snapToInterval(relativeCursorYPos, mouseEvent) {
  const INTERVAL = snapToIntervals[mouseEvent?.altKey ? "none" : musicBoxStore.state.appState.snapTo];

  if (!INTERVAL) return relativeCursorYPos;

  // I arrived at this formula through trial-and-error with Josiah, and it works!
  const snappedYPos = Math.round((relativeCursorYPos - NOTE_LINE_STARTING_GAP) / INTERVAL) * INTERVAL + NOTE_LINE_STARTING_GAP;

  // This prevents us from snapping notes to positions inside the starting gap.
  return snappedYPos < NOTE_LINE_STARTING_GAP ? NOTE_LINE_STARTING_GAP : snappedYPos;
}

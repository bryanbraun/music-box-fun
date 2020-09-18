import { musicBoxStore } from '../music-box-store.js';
import { boxTypeHoleWidths, getCurrentBoxType } from '../common/box-types.js';

export const holeWidthManager = {
  setCssVariables() {
    const numberOfNotes = getCurrentBoxType();
    document.documentElement.style.setProperty('--number-of-notes', numberOfNotes);
    document.documentElement.style.setProperty('--hole-width', boxTypeHoleWidths[numberOfNotes]);
  },

  subscribeToBoxTypeChanges() {
    musicBoxStore.subscribe('songState.songData', this.setCssVariables.bind(this));
  }
}

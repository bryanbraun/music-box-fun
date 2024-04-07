import { musicBoxStore } from '../music-box-store.js';
import { boxTypeHoleWidths, getCurrentBoxType } from '../common/box-types.js';

export const holeWidthManager = {
  setCssVariables() {
    const numberOfNotes = getCurrentBoxType();
    const holeWidthPx = boxTypeHoleWidths[numberOfNotes];

    // The printScaleFactor formula is used to determine how much to scale down the page
    // when printing a music box song. This printScale is based on the hole-width.
    // We derived the formula from these two data points found during manual testing:
    //  [12px hole-width → 0.63 scale] and [16px hole-width → 0.5 scale].
    // We round the printScaleFactor to the nearest hundredth because we were seeing note
    // positions drift for unrounded printScaleFactor values during testing.
    const printScaleFactor = 1.02 - (parseInt(holeWidthPx) * 0.0325);
    const printScaleFactorRounded = Math.ceil(printScaleFactor * 100) / 100;

    document.documentElement.style.setProperty('--number-of-notes', numberOfNotes);
    document.documentElement.style.setProperty('--hole-width', holeWidthPx);
    document.documentElement.style.setProperty('--print-scale-factor', printScaleFactorRounded);
  },

  subscribeToBoxTypeChanges() {
    musicBoxStore.subscribe('songState.songData', this.setCssVariables.bind(this));
  }
}

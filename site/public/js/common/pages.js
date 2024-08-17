import { NUMBER_OF_BARS_PER_PAGE, NOTE_LINE_STARTING_GAP, QUARTER_BAR_GAP } from "./constants.js";
import { musicBoxStore } from "../music-box-store.js";

export function getNumberOfBars() {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--number-of-bars'));
}

// This can include blank pages added by the user.
export function getNumberOfPagesOnScreen() {
  return getNumberOfBars() / NUMBER_OF_BARS_PER_PAGE;
}

export function getFinalBarLineYPos() {
  return NOTE_LINE_STARTING_GAP + (getNumberOfBars() * QUARTER_BAR_GAP);
}

export function resizePaperIfNeeded(newFinalNotePosition) {
  const lastPageThreshold = getFinalBarLineYPos();
  const currentNumberOfPages = getNumberOfPagesOnScreen();
  const minNumberOfPagesNeeded = Math.ceil((newFinalNotePosition - NOTE_LINE_STARTING_GAP) / (NUMBER_OF_BARS_PER_PAGE * QUARTER_BAR_GAP)) || 1;

  if (newFinalNotePosition > lastPageThreshold) {
    // Publish a one-off event telling the PaperFooter to re-render at a bigger size.
    musicBoxStore.publish('ResizePaper', currentNumberOfPages + 1);
  }

  if (currentNumberOfPages > minNumberOfPagesNeeded) {
    // Publish a one-off event telling the PaperFooter to re-render at a smaller size.
    musicBoxStore.publish('ResizePaper', minNumberOfPagesNeeded);
  }
}

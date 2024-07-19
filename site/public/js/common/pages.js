import { NUMBER_OF_BARS_PER_PAGE, NOTE_LINE_STARTING_GAP, QUARTER_BAR_GAP } from "./constants.js";

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

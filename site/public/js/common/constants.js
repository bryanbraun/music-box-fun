// These are constants that we use in multiple places in the app

const QUARTER_BAR_GAP = // 48 - Pixel distance between the black quarter note bars.
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--quarter-bar-gap').trim());
const EIGHTH_BAR_GAP = QUARTER_BAR_GAP / 2; // 24 - Pixel distance between the gray eighth note bars.
const SIXTEENTH_BAR_GAP = EIGHTH_BAR_GAP / 2; // 12 - Pixel distance between 16th notes (half-bars).

// CSS custom properties that are used in JS and won't change during app use.
const NOTE_LINE_STARTING_GAP = // 16
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--note-line-starting-gap').trim());
const FINAL_BAR_LINE = // 1
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--final-bar-line').trim());
const FOOTER_BUTTON_HEIGHT = // 48
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--footer-button-height').trim());

const DEFAULT_TEMPO = 110;

export {
  QUARTER_BAR_GAP,
  EIGHTH_BAR_GAP,
  SIXTEENTH_BAR_GAP,
  NOTE_LINE_STARTING_GAP,
  FINAL_BAR_LINE,
  FOOTER_BUTTON_HEIGHT,
  DEFAULT_TEMPO
}

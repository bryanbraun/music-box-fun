// These are constants that we use in multiple places in the app

const QUARTER_BAR_GAP = 48; // Pixel distance between the black quarter note bars.
const EIGHTH_BAR_GAP = 24; // Pixel distance between the gray eighth note bars.
const SIXTEENTH_BAR_GAP = 12; // Pixel distance between 16th notes (half-bars).
const STANDARD_HOLE_RADIUS = 8; // Used only in calculations on stored note data.

// CSS custom properties that are used in JS and won't change during app use.
const NOTE_LINE_STARTING_GAP = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--note-line-starting-gap').trim());
const FOOTER_BUTTON_HEIGHT = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--footer-button-height').trim());

const DEFAULT_TEMPO = 110;

export {
  QUARTER_BAR_GAP,
  EIGHTH_BAR_GAP,
  SIXTEENTH_BAR_GAP,
  STANDARD_HOLE_RADIUS,
  NOTE_LINE_STARTING_GAP,
  FOOTER_BUTTON_HEIGHT,
  DEFAULT_TEMPO
}

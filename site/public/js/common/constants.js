// These are constants that we use in multiple places in the app

const QUARTER_BAR_GAP = // 48 - Pixel distance between the black quarter note bars.
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--quarter-bar-gap').trim());
const EIGHTH_BAR_GAP = QUARTER_BAR_GAP / 2; // 24 - Pixel distance between the gray eighth note bars.
const SIXTEENTH_BAR_GAP = EIGHTH_BAR_GAP / 2; // 12 - Pixel distance between 16th notes (half-bars).

// CSS custom properties that are used in JS and won't change during app use.
const NOTE_LINE_STARTING_GAP = // 16
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--note-line-starting-gap').trim());
const FOOTER_BUTTON_HEIGHT = // 48
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--footer-button-height').trim());
const PAPER_SIDE_MARGIN = // 32
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--paper-side-margin').trim());
// We want to look up --playhead-distance-from-top-of-workspace, but the custom property uses calc which
// makes it difficult. Instead, we can query the playhead directly to look up it's calculated value. See:
// https://stackoverflow.com/q/56229772/1154642.
const PLAYHEAD_TO_VIEWPORT_TOP = document.querySelector('.music-box__playhead').getBoundingClientRect().top;

const DEFAULT_TEMPO = 110;
const NUMBER_OF_BARS_PER_PAGE = 52;
const NOTE_STARTING_THRESHOLD = NOTE_LINE_STARTING_GAP / 2;

// When we subscribe to an "asterisk" state (like "songState*"), it's possible for the callback to be
// triggered several times in quick succession. For example, this can happen when changing songs (because
// it updates a big chunk of state at once). In cases like these, the final state is the one that matters,
// so a brief debounce delay can help reduce processing.
const WAIT_FOR_STATE = 5;

export {
  QUARTER_BAR_GAP,
  EIGHTH_BAR_GAP,
  SIXTEENTH_BAR_GAP,
  NOTE_LINE_STARTING_GAP,
  NOTE_STARTING_THRESHOLD,
  FOOTER_BUTTON_HEIGHT,
  PAPER_SIDE_MARGIN,
  DEFAULT_TEMPO,
  NUMBER_OF_BARS_PER_PAGE,
  WAIT_FOR_STATE,
  PLAYHEAD_TO_VIEWPORT_TOP
}

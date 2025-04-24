// These are constants that we use in multiple places in the app

// CSS custom properties that are used in JS and won't change during app use.
// Custom properties that change during app use should not be defined here.
const QUARTER_BAR_GAP = // 48 - Pixel distance between the black quarter note bars.
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--quarter-bar-gap').trim());
const NOTE_LINE_STARTING_GAP = // 16
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--note-line-starting-gap').trim());
const FOOTER_BUTTON_HEIGHT = // 48
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--footer-button-height').trim());
const PAPER_SIDE_MARGIN = // 32
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--paper-side-margin').trim());
// We want to look up --playhead-distance-from-top-of-workspace, but the custom property uses calc which
// makes it difficult. Instead, we can query the playhead directly to look up it's calculated value. See:
// https://stackoverflow.com/q/56229772/1154642. This should't change during app use.
const PLAYHEAD_TO_VIEWPORT_TOP = document.querySelector('.music-box__playhead').getBoundingClientRect().top;

// Our timing is measured in ticks. Ticks, like "quarter notes" are relative to the tempo. We define the
// length of a tick by setting the PPQ (Pulse Per Quarter Note), a setting used in Tone.js and MIDI.
//   - PPQ = the number of ticks in a quarter note.
//   - 1 quarter note = 48px (in our UI).
//   - Thus, by conversion, it's 4 ticks per pixel.
//  For more details, see: https://github.com/Tonejs/Tone.js/wiki/Time#ticks
const PULSE_PER_QUARTER_NOTE = 192;
const TICKS_PER_PIXEL = PULSE_PER_QUARTER_NOTE / QUARTER_BAR_GAP; // 4
const NOTE_DURATION_IN_TICKS = PULSE_PER_QUARTER_NOTE / 2; // Use an "eighth note" duration for all notes.
const EIGHTH_BAR_GAP = QUARTER_BAR_GAP / 2; // 24 - Pixel distance between the gray eighth note bars.
const SIXTEENTH_BAR_GAP = EIGHTH_BAR_GAP / 2; // 12 - Pixel distance between 16th notes (half-bars).
const DEFAULT_TEMPO = 110;
const MAX_TEMPO = 180; // Max tempo is based on how fast a person can rotate the handle. This should be realistic!
const NUMBER_OF_BARS_PER_PAGE = 52;
const NOTE_STARTING_THRESHOLD = NOTE_LINE_STARTING_GAP / 2;

// When we subscribe to an "asterisk" state (like "songState*"), it's possible for the callback to be
// triggered several times in quick succession. For example, this can happen when changing songs (because
// it updates a big chunk of state at once). In cases like these, the final state is the one that matters,
// so a brief debounce delay can help reduce processing.
const WAIT_FOR_STATE = 5;
const DEFAULT_SONG_TITLE = 'Untitled Song';

export {
  QUARTER_BAR_GAP,
  NOTE_LINE_STARTING_GAP,
  FOOTER_BUTTON_HEIGHT,
  PAPER_SIDE_MARGIN,
  PLAYHEAD_TO_VIEWPORT_TOP,
  PULSE_PER_QUARTER_NOTE,
  TICKS_PER_PIXEL,
  NOTE_DURATION_IN_TICKS,
  EIGHTH_BAR_GAP,
  SIXTEENTH_BAR_GAP,
  DEFAULT_TEMPO,
  MAX_TEMPO,
  NUMBER_OF_BARS_PER_PAGE,
  NOTE_STARTING_THRESHOLD,
  WAIT_FOR_STATE,
  DEFAULT_SONG_TITLE,
}

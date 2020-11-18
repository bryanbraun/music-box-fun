// State
//
// Notes are stored using Scientific Pitch Notation
// https://en.wikipedia.org/wiki/Scientific_pitch_notation
//
// We save them in state as strings so our proxy can publish
// the the object keys ("C4", etc) on set() as PubSub events.
import { DEFAULT_TEMPO } from './common/constants.js';

// Note: this represents an initial state template. We clone
// it when using it, so we don't end up with new data in it.
export const state = {
  appState: {
    isSnappingToGrid: true,
    isPlaying: false,
    isAudioDisabledMessageVisible: false,
    isAudioDisabledMessageResolved: false,
    offCanvasSidebarFocused: 'none',
    activeTab: 'shared-songs',
    songLibraryQuery: ''
  },

  // DANGER! CHANGING THE STRUCTURE OR KEYS OF THE OBJECT BELOW COULD
  // BREAK LINKS TO EXISTING SONGS. MAKE SURE YOUR CHANGES ARE VERSIONED
  // OR BACKWARDS COMPATIBLE. SEE "/DOCS/URL-DATA.MD" FOR DETAILS.
  songState: {
    songTitle: '',
    tempo: DEFAULT_TEMPO,
    songData: {
      C4: [],
      D4: [],
      E4: [],
      F4: [],
      G4: [],
      A4: [],
      B4: [],
      C5: [],
      D5: [],
      E5: [],
      F5: [],
      G5: [],
      A5: [],
      B5: [],
      C6: [],
    }
  }
};


// The keys in songState (above) can be minified before being compressed
// and saved in the URL, making the URLs shorter. This single-level map
// helps by providing a one-character alt-name for everything in songState.
// CHANGING VALUES IN THIS MAP COULD BREAK LINKS TO EXISTING SONGS.
export const minifyMap = {
  songTitle: 'a',
  songData: 'c',
  C4: 'd',
  D4: 'e',
  E4: 'f',
  F4: 'g',
  G4: 'h',
  A4: 'i',
  B4: 'j',
  C5: 'k',
  D5: 'l',
  E5: 'm',
  F5: 'n',
  G5: 'o',
  A5: 'p',
  B5: 'q',
  C6: 'r',
  D6: 's',
  E6: 't',
  F6: 'u',
  G6: 'v',
  A6: 'w',
  C3: 'x',
  D3: 'y',
  G3: 'z',
  A3: 'A',
  B3: 'B',
  'F#4': 'C',
  'G#4': 'D',
  'A#4': 'E',
  'C#5': 'F',
  'D#5': 'G',
  'F#5': 'H',
  'G#5': 'I',
  'A#5': 'J',
  tempo: 'K',
}

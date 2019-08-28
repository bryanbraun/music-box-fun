// State
//
// Notes are stored using Scientific Pitch Notation
// https://en.wikipedia.org/wiki/Scientific_pitch_notation
//
// We save them in state as strings so our proxy can publish
// the the object keys ("C4", etc) on set() as PubSub events.

export const state = {
  appState: {
    isScrolling: false,
    isAudioDisabledMessageVisible: false,
    isAudioDisabledMessageResolved: false,
  },

  // DANGER! CHANGING THE STRUCTURE OR KEYS OF THE OBJECT BELOW COULD
  // BREAK LINKS TO EXISTING SONGS. MAKE SURE YOUR CHANGES ARE VERSIONED
  // OR BACKWARDS COMPATIBLE. SEE "/DOCS/URL-DATA.MD" FOR DETAILS.
  songState: {
    songTitle: '',
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
}

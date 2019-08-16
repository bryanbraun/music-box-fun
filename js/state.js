export const state = {
  appState: {
    isScrolling: false,
  },
  songState: {
    songTitle: "",
    playSpeed: 0,
    // Using Scientific Pitch Notation
    // https://en.wikipedia.org/wiki/Scientific_pitch_notation
    //
    // We save them in state as strings so our proxy can publish
    // the the object keys ("C4", etc) on set() as pubsub events.
    songData: {
      "C4": "8",
      "D4": "36",
      "E4": "60",
      "F4": "84",
      "G4": "110",
      "A4": "136",
      "B4": "160",
      "C5": "184",
      "D5": "",
      "E5": "",
      "F5": "",
      "G5": "",
      "A5": "",
      "B5": "",
      "C6": "",
    }
  }
};

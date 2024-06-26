import { musicBoxStore } from '../music-box-store.js';

export const boxTypePitches = {
  '15': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'],
  '20': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6', 'E6', 'F6', 'G6', 'A6'],
  '30': ['C3', 'D3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5', 'C6', 'D6', 'E6'],
  '30F': ['F3', 'G3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5', 'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'G6', 'A6'],
}

// Define the hole-width for each box type, to keep the size of the paper reasonable.
// This could be improved in the future by taking screen-width into consideration.
// We're only using even-valued hole-widths for now because we use the hole-radius in
// some calculations, and keeping that an integer simplifies some things.
export const boxTypeHoleWidths = {
  '15': '16px',
  '20': '14px',
  '30': '12px',
  '30F': '12px',
}

export const boxTypeLinks = {
  '15': 'https://amzn.to/3jPCAMG',
  '20': 'https://www.grand-illusions.com/20-note-music-box-set-c2x21140292',
  '30': 'https://amzn.com/dp/B08L3V6LN6',
  '30F': 'https://amzn.com/dp/B0774TSP3T/'
};

export const boxTypeTitles = {
  '15': '15-note',
  '20': '20-note',
  '30': '30-note',
  '30F': '30-note (F key)'
}

// Determines the box type based on the pitches in state
//
// If we get more "computed" functions like this, we could
// make a generic service file that contains them all, and
// add support for improved performance (like memoization
// or cached values subscribed to state changes).
export function getCurrentBoxType() {
  const songDataPitches = Object.keys(musicBoxStore.state.songState.songData);
  const boxTypesKeys = Object.keys(boxTypePitches);
  let currentBoxType = '';

  for (let i = 0; i < boxTypesKeys.length; i++) {
    const thisBoxTypePitches = boxTypePitches[boxTypesKeys[i]].concat(); // Use concat to create a copy

    if (songDataPitches.sort().join(',') === thisBoxTypePitches.sort().join(',')) {
      currentBoxType = boxTypesKeys[i];
      break;
    }
  }

  if (!currentBoxType) {
    throw Error('The current Music Box Type could not be identified.');
  }

  return currentBoxType;
}

export function getCurrentPitchArray() {
  return boxTypePitches[getCurrentBoxType()];
}

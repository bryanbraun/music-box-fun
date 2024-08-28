// We use versioned URLs to allow for backwards compatibility of songs.
//
// Our approach to handling older songs is to adapt their data to work for
// the newest version of the app, and to do it all at once, when pulling the
// data out of the URL. This way, we don't have fallbacks and versioning logic
// scattered throughout the whole app.

import { cloneDeep } from '../utils/clone.js';
import { DEFAULT_TEMPO, NOTE_LINE_STARTING_GAP } from '../constants.js';

// Previously, the stored Ypos values were arbitrary, being:
//
//  "The y-position of the top of the note, IF it were 'original' hole size"
//  (16px, being the size used for the holes on the the 10-note music box).
//
// It makes more sense to store the 'center' of the note, which is the "strike time"
// (or the moment the sound should be played). Doing this means the values can be
// input directly into ToneJS without adjustments.
function makeYposRepresentNoteCenters(songState) {
  const ORIGINAL_HOLE_RADIUS = 8;
  let adaptedSongState = cloneDeep(songState);

  Object.keys(adaptedSongState.songData).forEach(pitchId => {
    adaptedSongState.songData[pitchId] = adaptedSongState.songData[pitchId].map(ypos => ypos + ORIGINAL_HOLE_RADIUS);
  });

  return adaptedSongState;
}

function adjustYposFrom50PixelBarsTo48PixelBars(songState) {
  let ORIGINAL_EIGHTH_BAR_GAP = 25;
  let adaptedSongState = cloneDeep(songState);

  Object.keys(adaptedSongState.songData).forEach(pitchId => {
    adaptedSongState.songData[pitchId] = adaptedSongState.songData[pitchId].map(ypos => {
      // Drops one pixel per eighth-bar-gap. The 'round' ensures that the pixel we drop is in the center of the gap,
      // The starting gap (and 'max') ensures we don't drop pixels before the first bar, since that's an edge case.
      let numberOfPixelsToRemove = Math.round(Math.max(0, (ypos - NOTE_LINE_STARTING_GAP)) / ORIGINAL_EIGHTH_BAR_GAP);
      return ypos - numberOfPixelsToRemove;
    });
  });

  return adaptedSongState;
}

function adaptDataForVersions(songStateFromTheUrl, versionInUrl) {
  let adaptedSongState = cloneDeep(songStateFromTheUrl);

  // This exists because early versions of the app had no tempo slider
  if (!adaptedSongState.tempo) {
    adaptedSongState.tempo = DEFAULT_TEMPO;
  }

  if (versionInUrl < 1) {
    adaptedSongState = makeYposRepresentNoteCenters(adaptedSongState);
    adaptedSongState = adjustYposFrom50PixelBarsTo48PixelBars(adaptedSongState);
  }

  return adaptedSongState;
}


export {
  adaptDataForVersions
}

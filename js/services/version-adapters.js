// We use versioned URLs to allow for backwards compatibility of songs.
//
// Our approach to handling older songs is to adapt their data to work for
// the newest version of the app, and to do it all at once, when pulling the
// data out of the URL. This way, we don't have fallbacks and versioning logic
// scattered throughout the whole app.

import { cloneDeep } from '../utils/clone.js';
import { DEFAULT_TEMPO, STANDARD_HOLE_RADIUS } from '../utils/constants.js';

// Previously, the stored Ypos values were arbitrary, being:
//
//  "The y-position of the top of the note, IF it were 'standard' note size"
//  (16px, being the size used for the holes on the the 10-note music box).
//
// It makes more sense to store the 'center' of the note, which is the "strike time"
// (or the moment the sound should be played). Doing this means the values can be
// input directly into ToneJS without adjustments. We still need to make adjustments,
// when calculating the translateY value for the UI, but I think that's ok... we
// were adjusting it anyways to accommodate the various hole sizes.
function makeYposRepresentNoteCenters(songState) {
  let adaptedSongState = cloneDeep(songState);

  Object.keys(adaptedSongState.songData).forEach(pitchId => {
    adaptedSongState.songData[pitchId] = adaptedSongState.songData[pitchId].map(ypos => ypos + STANDARD_HOLE_RADIUS);
  });

  return adaptedSongState;
}

function adjustYposFrom50PixelBarsTo48PixelBars(songState) {
  let adaptedSongState = cloneDeep(songState);
  let FORMER_EIGHTH_BAR_GAP = 25;

  // Note: this refers to the stored offset which is always 16, not the UI offset which can change
  // depending on the hole size. We use the stored offset because we are working with stored data.
  let OFFSET_BEFORE_FIRST_BAR = 16;

  Object.keys(adaptedSongState.songData).forEach(pitchId => {
    adaptedSongState.songData[pitchId] = adaptedSongState.songData[pitchId].map(ypos => {
      // Drops one pixel per eighth-bar-gap. The 'round' ensures that the pixel we drop is in the center of the gap,
      // The offset (and 'max') ensures we don't drop pixels before the first bar, since that's an edge case.
      let numberOfPixelsToRemove = Math.round(Math.max(0, (ypos - OFFSET_BEFORE_FIRST_BAR)) / FORMER_EIGHTH_BAR_GAP);
      return ypos - numberOfPixelsToRemove;
    });
  });

  return adaptedSongState;
}

function adaptDataForVersions(songStateFromTheUrl, versionInUrl) {
  let adaptedSongState = cloneDeep(songStateFromTheUrl);

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

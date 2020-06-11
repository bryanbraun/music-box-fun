// These are constants that we use in multiple places in the app

const QUARTER_BAR_GAP = 50; // Pixel distance between the black quarter note bars.
const EIGHTH_BAR_GAP = 25; // Pixel distance between the gray eighth note bars.
const STANDARD_HOLE_RADIUS = 8; // Used only in calculations on stored note data.

// The "dead zone" is the region after a note, wherein if a note is placed, it
// will display as red and will not play a note (due to mechanical limitations).
// We base this length on the actual boxes, and the STANDARD_HOLE_RADIUS to ensure
// the dead-zone is the same when we use different hole-sizes.
const DEAD_ZONE_LENGTH = QUARTER_BAR_GAP - STANDARD_HOLE_RADIUS - 1;

// We need this because the original app had no tempo slider, so it's used as a
// fallback for the songs that were saved without any tempo data.
const DEFAULT_TEMPO = 110;

export {
  QUARTER_BAR_GAP,
  EIGHTH_BAR_GAP,
  STANDARD_HOLE_RADIUS,
  DEAD_ZONE_LENGTH,
  DEFAULT_TEMPO
}

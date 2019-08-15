import { musicBoxStore } from '../music-box-store.js';

/**
 * EVENT HANDLERS
 */
function showShadowNote(event) {
  const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');
  _positionShadowNote(shadowNoteEl, event.layerY);
  shadowNoteEl.classList.add('shadow-note--visible');
}

function hideShadowNote(event) {
  const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');
  shadowNoteEl.style = `transform: translateY(0px)`;
  shadowNoteEl.classList.remove('shadow-note--visible');
}

function haveShadowNoteFollowCursor(event) {
  const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');
  _positionShadowNote(shadowNoteEl, event.layerY);
}

function punchHole(event) {
  musicBoxStore.dispatch('addNote', _getNoteData(event));
}

function removeHole(event) {
  musicBoxStore.dispatch('removeNote', _getNoteData(event));
}

/**
 * EVENT HELPERS
 */
function _getNoteData(event) {
  const pitch = event.target.parentElement.id;
  const yposRegex = /translateY\((\d+)px\)/;
  const yposMatch = event.target.style.transform.match(yposRegex);
  const ypos = (yposMatch && yposMatch[1]) ? parseInt(yposMatch[1]) : console.error('Could not find note position');

  return { pitch, ypos };
}

function _positionShadowNote(noteEl, yPosition) {
  // TODO: we should probably cache this value, since this is code is run a ton on hover.
  const holeWidth = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--hole-width').trim()
  );

  // Note: layerY is supported across browsers, but it's technically
  // not a standard, so this code may fail at some point in the future.
  // See: https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/layerY
  noteEl.style = `transform: translateY(${yPosition - (holeWidth / 2)}px)`;
}

export {
  showShadowNote,
  hideShadowNote,
  haveShadowNoteFollowCursor,
  punchHole,
  removeHole,
};

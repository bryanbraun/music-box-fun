import { musicBoxStore } from '../music-box-store.js';

function showShadowNote(event) {
  const shadowNote = event.currentTarget.querySelector('.shadow-note');
  shadowNote.classList.add('shadow-note--visible');
}

function hideShadowNote(event) {
  const shadowNote = event.currentTarget.querySelector('.shadow-note');
  shadowNote.classList.remove('shadow-note--visible');
}

function haveShadowNoteFollowCursor(event) {
  const shadowNote = event.currentTarget.querySelector('.shadow-note');
  const holeWidth = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--hole-width').trim()
  );

  // Note: layerY is supported across browsers, but it's technically
  // not a standard, so this code may fail at some point in the future.
  // See: https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/layerY
  shadowNote.style = `transform: translateY(${event.layerY - (holeWidth / 2)}px)`;
}

function punchHole(event) {
  const pitch = event.target.parentElement.id;
  const yposRegex = /translateY\((\d+)px\)/;
  const yposMatch = event.target.style.transform.match(yposRegex);
  const ypos = (yposMatch && yposMatch[1]) ? parseInt(yposMatch[1]) : console.error('Could not find note position');

  musicBoxStore.dispatch('addNote', { pitch, ypos });
}

export {
  showShadowNote,
  hideShadowNote,
  haveShadowNoteFollowCursor,
  punchHole,
};

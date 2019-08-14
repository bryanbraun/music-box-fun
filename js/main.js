import { SongTitle } from './components/song-title.js';
import { musicBoxStore } from './music-box-store.js';

// Here, we can query dom elements and add event listeners for the initial page load, if we want.
// If it gets too cluttered I'll move it to another file.
const noteLines = document.querySelectorAll('.note-line');
const shadowNotes = document.querySelectorAll('.shadow-note');

noteLines.forEach((noteLine) => {
  noteLine.addEventListener('mouseenter', (event) => {
    const shadowNote = event.currentTarget.querySelector('.shadow-note');
    shadowNote.classList.add('shadow-note--visible');
  });
  noteLine.addEventListener('mousemove', (event) => {
    const shadowNote = event.currentTarget.querySelector('.shadow-note');
    const holeWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--hole-width').trim()
    );

    // Note: layerY is supported across browsers, but it's technically
    // not a standard, so this code may fail at some point in the future.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/layerY
    shadowNote.style = `transform: translateY(${event.layerY - (holeWidth / 2)}px)`;
  });
  noteLine.addEventListener('mouseleave', (event) => {
    const shadowNote = event.currentTarget.querySelector('.shadow-note');
    shadowNote.classList.remove('shadow-note--visible');
  });
});

shadowNotes.forEach((shadowNote) => {
  shadowNote.addEventListener('click', (event) => {
    const pitch = event.target.parentElement.getAttribute('data-pitch');
    const yposRegex = /translateY\((\d+)px\)/;
    const yposMatch = event.target.style.transform.match(yposRegex);
    const ypos = (yposMatch && yposMatch[1]) ? parseInt(yposMatch[1]) : console.error('Could not find note position');

    musicBoxStore.dispatch('addNote', { pitch, ypos });
  });
});

// Initial page render
const songTitle = new SongTitle().render();

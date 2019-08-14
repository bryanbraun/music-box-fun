import { SongTitle } from './components/song-title.js';
import { NoteLines } from './components/note-lines.js';

// Don't remove this. It's needed to instantiate the store before our renders.
// There's probably a better way to run this code besides just importing. Something
// to consider...
import { musicBoxStore } from './music-box-store.js';

// Here, we can query dom elements and add event listeners on the initial page load,
// for things that won't re-render, if we want. If it gets too cluttered, I'll move it to another file.
window.addEventListener("load", startup, false);

function startup() {
  // We get the playhead position by querying the playhead directly (instead of looking
  // up the CSS variable) because the variable uses calc which makes it difficult to
  // query. See https://stackoverflow.com/q/56229772/1154642.
  const playheadPosition = parseInt(
    getComputedStyle(document.querySelector('.music-box__playhead'))
      .getPropertyValue('top')
      .trim()
  );

  const options = {
    root: null,
    rootMargin: `-${playheadPosition}px 0px 0px 0px`,
    threshold: 1
  }

  const isAtPlayhead = (objectPositionTop) => {
    const comparisonBuffer = 10;
    return Math.abs(objectPositionTop - playheadPosition < comparisonBuffer)
  }

  const intersectionHandler = (entries, observer) => {
    entries.forEach(entry => {
      if (isAtPlayhead(entry.boundingClientRect.top)) {
        console.log(`A ${entry.target.parentElement.id} is at the playhead`);
      }
    });
  }

  const observer = new IntersectionObserver(intersectionHandler, options);

  // The callback gets run once, with all these observed entries passed in
  // I'm not sure why... I think it's on page load, but doing it
  // after page load didn't seem to make it go away.
  document.querySelectorAll('.hole').forEach(hole => {
    observer.observe(hole);
  });
}

// Eventually, we'll load URL data into our store here.

// Initial page render
new SongTitle().render();
new NoteLines().render();

import { PageScroll } from './components/page-scroll.js';
import { SongTitle } from './components/song-title.js';
import { NoteLines } from './components/note-lines.js';
import { PlayButton } from './components/play-button.js';
import { SpeedSlider } from './components/speed-slider.js';

import { musicBoxStore, initMusicBoxStore } from './music-box-store.js';
import { setupPlayheadObserver } from './playhead-observer.js';

initMusicBoxStore();

// Here, we can query dom elements and add event listeners on the initial page load,
// for things that won't re-render, if we want. If it gets too cluttered, I'll move it to another file.
document.addEventListener('keydown', event => {
  const isInsideTextInput = (event.target.tagName === 'INPUT');
  if (!isInsideTextInput && event.keyCode === 32) {
    event.preventDefault(); // Prevent default space bar page scroll.
    musicBoxStore.dispatch('toggleScrolling', !musicBoxStore.state.appState.isScrolling);
  }
});

// Eventually, we'll load URL data into our store here.

// Playhead Observer must be setup before rendering notes.
setupPlayheadObserver();

// Initial page render
new PageScroll().render();
new SongTitle().render();
new NoteLines().render();
new PlayButton().render();
new SpeedSlider().render();

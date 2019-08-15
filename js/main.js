import { SongTitle } from './components/song-title.js';
import { NoteLines } from './components/note-lines.js';

import { initMusicBoxStore } from './music-box-store.js';
import { setupPlayheadObserver } from './playhead-observer.js';

initMusicBoxStore();

// Here, we can query dom elements and add event listeners on the initial page load,
// for things that won't re-render, if we want. If it gets too cluttered, I'll move it to another file.

// Eventually, we'll load URL data into our store here.

// Playhead Observer must be setup before rendering notes.
setupPlayheadObserver();

// Initial page render
new SongTitle().render();
new NoteLines().render();

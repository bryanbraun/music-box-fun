import { SongTitle } from './components/song-title.js';
import { NoteLines } from './components/note-lines.js';

// Here, we can query dom elements and add event listeners on the initial page load,
// for things that won't re-render, if we want. If it gets too cluttered, I'll move it to another file.

// Eventually, we'll load URL data into our store here.

// Initial page render
new SongTitle().render();
new NoteLines().render();

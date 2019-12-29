import { SongTitle } from './components/song-title.js';
import { NoteHeader } from './components/note-header.js';
import { NoteLines } from './components/note-lines.js';
import { PlayButton } from './components/play-button.js';
import { NewSongButton } from './components/new-song-button.js';
import { MusicBoxTypeSelect } from './components/music-box-type-select.js';
import { SnapToGridToggle } from './components/snap-to-grid-toggle.js';
import { PageTitle } from './components/page-title.js';
import { AudioDisabledMessage } from './components/audio-disabled-message.js';
import { SongUpdatedMessage } from './components/song-updated-message.js';
import { TwitterShareButton } from  './components/twitter-share-button.js';
import { PaperFooter } from './components/paper-footer.js';

import { musicBoxStore } from './music-box-store.js';
import { setupSampler } from './services/sampler.js';
import { playheadObserver } from './services/playhead-observer.js';
import { setupAudioContextFallbackForRestrictiveBrowsers } from './subscribers/audio-context.js';
import { setupKeyboardEvents } from './subscribers/keyboard-manager.js';
import { urlManager } from './subscribers/url-manager.js';
import { pageScroller } from './subscribers/page-scroller.js';

urlManager.getStateFromUrlAsync().then(urlState => {
  // We load URL song data into state first, before we have any listeners
  // set up for our PubSub state-change events. This way, this change won't
  // trigger any re-renders.
  if (urlState) {
    musicBoxStore.setState('songState', urlState);
  }

  // Playhead Observer must be setup before rendering notes, because we
  // observe new notes as they are created. Note: this step looks performance
  // intensive. It might be worth looking into why that is, and how to improve it.
  playheadObserver.setup();

  // Initial page render
  new SongTitle().render();
  new NoteHeader().render();
  new NoteLines().render();
  new PlayButton().render();
  new NewSongButton().render();
  new MusicBoxTypeSelect().render();
  new SnapToGridToggle().render();
  new AudioDisabledMessage().render();
  new PageTitle().render();
  new TwitterShareButton().render();
  new PaperFooter().render();

  new SongUpdatedMessage(); // This element is hidden by default, so it doesn't need to render on page load.

  pageScroller.subscribeToScrollState();

  // Do this at the end, so rendering things doesn't accidentally trigger url changes
  // (I don't think it would, but maybe!)
  urlManager.subscribeUrlToStateChanges();
  urlManager.subscribeUrlToExternalHashChanges();
});

setupSampler();
setupKeyboardEvents();
setupAudioContextFallbackForRestrictiveBrowsers();

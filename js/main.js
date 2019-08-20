import { PageScroll } from './components/page-scroll.js';
import { SongTitle } from './components/song-title.js';
import { NoteLines } from './components/note-lines.js';
import { PlayButton } from './components/play-button.js';
import { SpeedSlider } from './components/speed-slider.js';
import { AudioDisabledMessage } from './components/audio-disabled-message.js';

import { musicBoxStore } from './music-box-store.js';
import { setupPlayheadObserver } from './playhead-observer.js';
import { setupKeyboardEvents, enableAudioContextForRestrictiveBrowsers } from './document.js';
import { urlManager } from './components/url-manager.js';

urlManager.getStateFromUrlAsync().then(urlState => {
  // We load URL song data into state first, before we have any listeners
  // set up for our PubSub state-change events. This way, this change won't
  // trigger any re-renders.
  if (urlState) {
    musicBoxStore.dispatch('loadSong', urlState);
  }

  // Playhead Observer must be setup before rendering notes, because we
  // observe new notes as they are created. Note: this step looks performance
  // intensive. It might be worth looking into why that is, and how to improve it.
  setupPlayheadObserver();

  // Initial page render
  new PageScroll().render();
  new SongTitle().render();
  new NoteLines().render();
  new PlayButton().render();
  new SpeedSlider().render();
  new AudioDisabledMessage().render();

  // Do this at the end, so rendering things doesn't accidentally trigger url changes
  // (I don't think it would, but maybe!)
  urlManager.subscribeUrlToStateChanges();
  urlManager.subscribeUrlToExternalHashChanges();
});

setupKeyboardEvents();
enableAudioContextForRestrictiveBrowsers();

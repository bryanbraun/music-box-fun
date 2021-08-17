import { BodyClass } from './components/body-class.js';
import { LeftSidebar } from './components/left-sidebar.js';
import { RightSidebar } from './components/right-sidebar.js';
import { SongTitle } from './components/song-title.js';
import { NoteHeader } from './components/note-header.js';
import { NoteLines } from './components/note-lines.js';
import { PlayButton } from './components/play-button.js';
import { PageTitle } from './components/page-title.js';
import { OffCanvasNavIcon } from './components/off-canvas-nav-icon.js';
import { OffCanvasControlsIcon } from './components/off-canvas-controls-icon.js';
import { OffCanvasOverlay } from './components/off-canvas-overlay.js';
import { BackToTopButton } from './components/back-to-top-button.js';
import { AudioDisabledMessage } from './components/audio-disabled-message.js';
import { SongUpdatedMessage } from './components/song-updated-message.js';
import { SongLinkButton } from './components/song-link-button.js';
import { TwitterShareButton } from  './components/twitter-share-button.js';
import { PaperFooter } from './components/paper-footer.js';

import { musicBoxStore } from './music-box-store.js';
import { setupServiceWorker } from './subscribers/register-service-worker.js';
import { setupSampler } from './common/sampler.js';
import { playheadObserver } from './common/playhead-observer.js';
import { setupOnClickOutside } from './common/on-click-outside.js';
import { setupAudioContextFallbackForRestrictiveBrowsers } from './subscribers/audio-context.js';
import { setupKeyboardEvents } from './subscribers/keyboard-manager.js';
import { urlManager } from './subscribers/url-manager.js';
import { holeWidthManager } from './subscribers/hole-width-manager.js';
import { audioPlayer } from './subscribers/audio-player.js';
import { songPauser } from './subscribers/song-pauser.js';

import { setupTestObjects } from './test.js';

urlManager.getStateFromUrlAsync().then(urlState => {
  // Initialize our global state with song data. We don't need to call setState
  // because we're doing this before the initial render of any of the components.
  if (urlState) {
    musicBoxStore.state.songState = urlState;
  }

  // Things we should set up before rendering components.
  playheadObserver.setup();           // because we observe new notes as they are created.
  holeWidthManager.setCssVariables(); // because note-lines rely on having the correct CSS variables.
  holeWidthManager.subscribeToBoxTypeChanges(); // because this event needs to fire before note-line-rerenders when state changes.

  // Initial page render
  new BodyClass().render();
  new LeftSidebar().render();
  new RightSidebar().render();
  new SongTitle().render();
  new NoteHeader().render();
  new NoteLines().render();
  new PlayButton({ id: 'floating-play-button' }).render();
  new OffCanvasNavIcon().render();
  new OffCanvasControlsIcon().render();
  new OffCanvasOverlay().render();
  new BackToTopButton().render();
  new AudioDisabledMessage().render();
  new PageTitle().render();
  new SongLinkButton().render();
  new TwitterShareButton().render();
  new PaperFooter().render(true);

  new SongUpdatedMessage(); // This element is hidden by default, so it doesn't need to render on page load.

  // Things we can set up after rendering components.
  audioPlayer.subscribeToPlayState();
  audioPlayer.subscribeToSongChanges();
  songPauser.subscribeToSongChanges();
  urlManager.subscribeUrlToStateChanges();
  urlManager.subscribeAppToNavigationChanges();
});

// These things don't need URL data, so they can happen asynchronously.
setupSampler(); // This setup can happen late, since the sampler isn't used until the moment a note is played.
setupServiceWorker();
setupKeyboardEvents();
setupAudioContextFallbackForRestrictiveBrowsers();
setupOnClickOutside();
setupTestObjects();
audioPlayer.setup();

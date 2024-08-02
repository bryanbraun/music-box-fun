import { musicBoxStore } from '../music-box-store.js';
import { debounce } from '../utils/debounce.js';

// For programmatically pausing the song. This is in it's own file because we
// needed to subscribe to the state but it didn't make sense to put in into the
// play button (which is UI only), the audio-player, (which doesn't affect
// scrolling), or the page-scroller (which doesn't affect audio).
export const songPauser = {
  pauseSongIfPlaying() {
    if (musicBoxStore.state.appState.isPlaying === true) {
      musicBoxStore.setState('appState.isPlaying', false);
    }
  },

  subscribeToSongChanges() {
    // This debounce fixed a bug where changing the box type while the song was
    // playing broke the page. This happened because changing the box type alters
    // many state properties at once, with the 'songState*' event getting triggered
    // for each one. Some of those states were "in between" box types, which caused
    // downstream components to fail while running getCurrentBoxType(). Debouncing
    // here ensures we don't trigger downstream events until the final state is set.
    musicBoxStore.subscribe('songState*', debounce(this.pauseSongIfPlaying.bind(this), 50));
  }
};

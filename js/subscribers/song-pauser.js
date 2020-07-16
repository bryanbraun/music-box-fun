import { musicBoxStore } from '../music-box-store.js';

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
    musicBoxStore.subscribe('songState*', this.pauseSongIfPlaying.bind(this));
  }
};

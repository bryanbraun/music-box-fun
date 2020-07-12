import { musicBoxStore } from '../music-box-store.js';

// For programmatically pausing the song. This is in it's own file because:
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

// These have one job: mutate state.
//
// Keep these simple, moving logic into the actions, whenever possible
export const mutations = {
  changeTitle(state, payload) {
    state.songState.songTitle = payload;
  },
  addNote(state, payload) {
    const { pitch, ypos } = payload;
    const newPitchString = state.songState.songData[pitch]
      .split(',')
      .concat(ypos)
      .filter(val => val.length !== 0)
      .sort((a, b) => Number(a) - Number(b))
      .join(',');
    state.songState.songData[pitch] = newPitchString;
  },
  removeNote(state, payload) {
    const { pitch, ypos } = payload;
    const newPitchString = state.songState.songData[pitch]
      .split(',')
      .filter(val => val !== ypos.toString())
      .join(',');
    state.songState.songData[pitch] = newPitchString;
  },
  changeSpeed(state, payload) {
    state.songState.playSpeed = payload;
  },
  toggleScrolling(state, payload) {
    state.appState.isScrolling = payload;
  },
  loadSong(state, payload) {
    state.songState = payload;
  }
};

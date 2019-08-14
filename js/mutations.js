// These have one job: mutate state.
//
// Keep these simple, moving logic into the actions, whenever possible
export const mutations = {
  changeTitle(state, payload) {
    state.songTitle = payload;
  },
  addNote(state, payload) {
    const { pitch, ypos } = payload;
    const newPitchString = state.songData[pitch]
      .split(',')
      .concat(ypos)
      .filter(val => val.length !== 0)
      .sort((a, b) => Number(a) - Number(b))
      .join(',');
    state.songData[pitch] = newPitchString;
  }
};

// @TODO: make sure I'm using these properly. They seem pretty useless right now...
export const actions = {
  changeTitle(context, payload) {
    context.commit('changeTitle', payload);
  },
  addNote(context, payload) {
    context.commit('addNote', payload);
  },
  removeNote(context, payload) {
    context.commit('removeNote', payload);
  },
  changeSpeed(context, payload) {
    context.commit('changeSpeed', payload);
  },
  toggleScrolling(context, payload) {
    context.commit('toggleScrolling', payload);
  },
  showAudioDisabledMessage(context, payload) {
    context.commit('showAudioDisabledMessage', payload);
  },
  resolveAudioDisabledMessage(context, payload) {
    context.commit('resolveAudioDisabledMessage', payload);
  },
  loadSong(context, payload) {
    context.commit('loadSong', payload);
  }
};

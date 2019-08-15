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
  }
};

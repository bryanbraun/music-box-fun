export const actions = {
  // @param {String} payload - The string for the new title
  changeTitle(context, payload) {
    context.commit('changeTitle', payload);
  },

  // @param {Object} payload - data for adding a note. Example:
  // {
  //    pitch: 'C4',  // A string for the pitch, using Scientific Pitch Notation.
  //    ypos: '554',  // The Y-position from the top of the note line, in pixels.
  //  }
  //
  addNote(context, payload) {
    context.commit('addNote', payload);
  }
};

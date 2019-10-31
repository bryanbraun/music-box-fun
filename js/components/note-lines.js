import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';
import { NoteLine } from './note-line.js';

export class NoteLines extends Component {
  constructor() {
    super({
      element: document.querySelector('#note-lines')
    });
  }

  // This should run on initial page load only, to start.
  render() {
    const noteLinesData = musicBoxStore.state.songState.songData;

    this.element.innerHTML = `
      ${Object.keys(noteLinesData)
        .map(pitchId => `<div class="note-line" id="${pitchId}"></div>`)
        .join('')}
    `;

    // Attach the new NoteLine components to the markup we just added.
    Object.keys(noteLinesData).forEach(id => {
      new NoteLine({ id }).render();
    });
  }
}

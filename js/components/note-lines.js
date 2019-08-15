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
    console.log('Notelines got rendered');

    this.element.innerHTML = `
      ${Object.keys(musicBoxStore.state.songData)
        .map(pitchId => `<div class="note-line" id="${pitchId}"></div>`)
        .join('')}
    `;

    // Attach the new NoteLine components to the markup we just added.
    Object.entries(musicBoxStore.state.songData).forEach(([id, noteData]) => {
      new NoteLine({ id, noteData }).render();
    });
  }
}

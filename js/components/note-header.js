import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class NoteHeader extends Component {
  constructor() {
    super({
      element: document.querySelector('#note-header'),
      renderTrigger: 'boxType'
    });
  }

  render() {
    const songData = musicBoxStore.state.songState.songData;

    this.element.innerHTML = `
      ${Object.keys(songData)
        .map(pitchId => `<div class="note-label">${pitchId[0]}</div>`)
        .join('')}
    `;
  }
}

import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import { getCurrentBoxType } from '../common/box-types.js';

export class NoteHeader extends Component {
  constructor() {
    super({
      element: document.querySelector('#note-header'),
      renderTrigger: 'boxType'
    });
  }

  render() {
    const songData = musicBoxStore.state.songState.songData;

    // @todo: could this be improved with ClassNames?
    if (getCurrentBoxType() === '30') {
      this.element.classList.add('thirty');
    } else {
      this.element.classList.remove('thirty');
    }

    this.element.innerHTML = `
      ${Object.keys(songData)
        .map(pitchId => (
          `<div class="note-label ${pitchId[1] === '#' ? 'sharp' : ''}">
            ${pitchId[0]}
          </div>`
        ))
        .join('')}
    `;
  }
}

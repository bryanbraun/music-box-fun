import { MBComponent } from '../music-box-component.js';
import { getCurrentBoxType, getCurrentPitchArray } from '../common/box-types.js';
import classNames from '../vendor/classnames.js';

export class NoteHeader extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#note-header'),
      renderTrigger: 'songState.songData'
    });
  }

  render() {
    const pitchArray = getCurrentPitchArray();

    this.element.innerHTML = `
      ${pitchArray.map(pitchId => (
        `<div class="note-label ${pitchId[1] === '#' ? 'sharp' : ''}">
          ${pitchId[0]}
        </div>`
      )).join('')}
    `;
  }
}

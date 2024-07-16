import { MBComponent } from '../music-box-component.js';
import { NoteLine } from './note-line.js';
import { getCurrentPitchArray } from '../common/box-types.js';

export class NoteLines extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#note-lines'),
      renderTrigger: 'songState.songData'
    });
  }

  render() {
    // We use this method (instead of iterating over songData directly)
    // to ensure that the order of the pitches is what we expect.
    const pitchArray = getCurrentPitchArray();

    this.element.innerHTML = `
      ${pitchArray.map(pitchId => (
        `<div class="note-line" id="${pitchId}"></div>`
      )).join('')}
    `;

    // Attach the new NoteLine components to the markup we just added.
    pitchArray.forEach(id => {
      new NoteLine({ id }).render();
    });
  }
}

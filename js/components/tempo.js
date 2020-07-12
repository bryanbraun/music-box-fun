import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import { TempoField } from './tempo-field.js';
import { TempoSlider } from './tempo-slider.js';
import { DEFAULT_TEMPO } from '../common/constants.js';

export class Tempo extends Component {
  constructor() {
    super({
      // A workaround that allows rerenders for new songs, without needing to make this a controlled component.
      // (it would be more accurate to use songState.songTitle, but that would "control" these components)
      renderTrigger: 'songState',

      element: document.querySelector('#tempo'),
    });

    // Constants
    this.MIN = 60;
    this.MAX = 160;
  }

  render() {
    this.element.innerHTML = `
      <div>Tempo</div>
      <div class="tempo-inputs">
        <div id="tempo-slider"></div>
        <div id="tempo-field"></div>
      </div>
    `;

    new TempoSlider({ id: 'tempo-slider', min: this.MIN, max: this.MAX, defaultTempo: DEFAULT_TEMPO }).render();
    new TempoField({ id: 'tempo-field', min: this.MIN, max: this.MAX, defaultTempo: DEFAULT_TEMPO }).render();
  }
}

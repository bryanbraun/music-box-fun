import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';
import { TempoField } from './tempo-field.js';
import { TempoSlider } from './tempo-slider.js';

export class Tempo extends Component {
  constructor() {
    super({
      element: document.querySelector('#tempo'),
    });

    // Constants
    this.MIN = 60;
    this.MAX = 160;
    this.DEFAULT_TEMPO = 110;
  }

  render() {
    this.element.innerHTML = `
      <div>Tempo</div>
      <div class="tempo-inputs">
        <div id="tempo-slider"></div>
        <div id="tempo-field"></div>
      </div>
    `;

    new TempoSlider({ id: 'tempo-slider', min: this.MIN, max: this.MAX, defaultTempo: this.DEFAULT_TEMPO }).render();
    new TempoField({ id: 'tempo-field', min: this.MIN, max: this.MAX, defaultTempo: this.DEFAULT_TEMPO }).render();
  }
}

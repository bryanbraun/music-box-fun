import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class SpeedSlider extends Component {
  constructor(props) {
    super({
      element: document.querySelector('#speed-slider')
    });
  }

  render() {
    this.element.innerHTML = `
      <div>Play Speed</div>
      <input type="range" min="-5" max="5" value="${musicBoxStore.state.songState.playSpeed}" />
    `;

    this.element.lastElementChild.addEventListener('input', event => {
      musicBoxStore.dispatch('changeSpeed', parseInt(event.target.value));
    });
  }
}

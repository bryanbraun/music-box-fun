import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class TempoSlider extends Component {
  constructor(props) {
    super({
      props,
      element: document.querySelector('#tempo-slider'),
      renderTrigger: 'TempoFieldUpdated',
    });
  }

  render() {
    const tempo = musicBoxStore.state.songState.tempo || this.props.defaultTempo;
    this.element.innerHTML = `
      <input
        class="tempo-slider"
        type="range"
        min="${this.props.min}"
        max="${this.props.max}"
        value="${tempo}"
      />
    `;

    this.element.lastElementChild.addEventListener('input', event => {
      musicBoxStore.setState('songState.tempo', parseInt(event.target.value));

      // Publish a one-off event telling the tempo field to re-render. We'd prefer
      // this over having the tempo field subscribe to 'songState.tempo' because
      // it's simpler to keep the tempo field an uncontrolled component.
      // (see https://reactjs.org/docs/uncontrolled-components.html)
      musicBoxStore.publish('TempoSliderUpdated');
    });
  }
}

import { Component } from '../alt-react/component.js';
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
      // Fix any values that are outside of the acceptable range.
      let acceptableValue = parseInt(event.target.value)
      acceptableValue = Math.max(acceptableValue, this.props.min);
      acceptableValue = Math.min(acceptableValue, this.props.max);
      event.currentTarget.value = acceptableValue;

      musicBoxStore.setState('songState.tempo', acceptableValue);

      // Publish a one-off event telling the tempo field to re-render. We'd prefer
      // this over having the tempo field subscribe to 'songState.tempo' because
      // it's simpler to keep the tempo field an uncontrolled component.
      // (see https://reactjs.org/docs/uncontrolled-components.html)
      musicBoxStore.publish('TempoSliderUpdated');
    });
  }
}

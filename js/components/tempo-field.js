import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class TempoField extends Component {
  constructor(props) {
    super({
      props,
      element: document.querySelector('#tempo-field'),
      renderTrigger: 'TempoSliderUpdated',
    });
  }

  render() {
    const tempo = musicBoxStore.state.songState.tempo || this.props.defaultTempo;
    this.element.innerHTML = `
      <input
        class="tempo-field"
        type="number"
        min="${this.props.min}"
        max="${this.props.max}"
        value="${tempo}"
      />
    `;

    this.element.lastElementChild.addEventListener('input', event => {
      musicBoxStore.setState('songState.tempo', parseInt(event.target.value));

      // Publish a one-off event telling the slider to re-render. We'd prefer this
      // over having the slider subscribe to 'songState.tempo' because it's simpler
      // to keep the slider an uncontrolled component.
      // (see https://reactjs.org/docs/uncontrolled-components.html)
      musicBoxStore.publish('TempoFieldUpdated');
    });
  }
}

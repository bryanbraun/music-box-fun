import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';

export class TempoField extends MBComponent {
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
        name="tempo-field"
        pattern="[0-9]*"
        inputmode="numeric"
      />
    `;

    this.element.lastElementChild.addEventListener('input', event => {
      let value = Number(event.target.value);

      // Fix any values that are outside of the acceptable range.
      value = isNaN(value) ? this.props.defaultTempo : value;
      value = Math.max(value, this.props.min);
      value = Math.min(value, this.props.max);

      musicBoxStore.setState('songState.tempo', parseInt(value));

      // Publish a one-off event telling the slider to re-render. We'd prefer this
      // over having the slider subscribe to 'songState.tempo' because it's simpler
      // to keep the slider an uncontrolled component.
      // (see https://reactjs.org/docs/uncontrolled-components.html)
      musicBoxStore.publish('TempoFieldUpdated');
    });

    this.element.lastElementChild.addEventListener('blur', event => {
      let fieldValue = Number(event.target.value);
      let storedValue = musicBoxStore.state.songState.tempo;

      if (fieldValue !== storedValue) {
        // If the value in the field still isn't acceptable when the user moves
        // out from this field, set the value to the storedValue (which should
        // have been adjusted to be in the acceptable range before storing).
        event.target.value = storedValue;
      }
    });
  }
}

import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';

export class SnapToGridSelect extends Component {
  constructor() {
    super({
      element: document.querySelector('#snap-to')
    });
  }

  async handleChange(event) {
    musicBoxStore.setState('appState.snapTo', event.target.value);
  }

  render() {
    const snapToSetting = musicBoxStore.state.appState.snapTo;
    const selectedNone = snapToSetting === 'none' ? 'selected=""' : '';
    const selectedGrid = snapToSetting === 'grid' ? 'selected=""' : '';
    const selected16ths = snapToSetting === '16ths' ? 'selected=""' : '';
    const selectedQuarterTriplet = snapToSetting === '¼ triplet' ? 'selected=""' : '';
    const selectedEighthTriplet = snapToSetting === '⅛ triplet' ? 'selected=""' : '';

    this.element.innerHTML = `
      <label class="snap-to">
        <span class="snap-to__label">Snap to</span>
        <select class="select">
          <option ${selectedNone} value="none">- none -</option>
          <option ${selectedGrid} value="grid">Grid</option>
          <option ${selected16ths} value="16ths">16ths</option>
          <option ${selectedQuarterTriplet} value="¼ triplet">¼ Triplet</option>
          <option ${selectedEighthTriplet} value="⅛ triplet">⅛ Triplet</option>
        </select>
      </label>
    `;

    this.element.querySelector('select').addEventListener('change', this.handleChange);
  }
}

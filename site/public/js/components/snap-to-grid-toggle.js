import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';

export class SnapToGridToggle extends Component {
  constructor() {
    super({
      element: document.querySelector('#snap-to-grid')
    });
  }

  handleToggle() {
    musicBoxStore.setState('appState.isSnappingToGrid', !musicBoxStore.state.appState.isSnappingToGrid);
  }

  render() {
    const checked = musicBoxStore.state.appState.isSnappingToGrid ? 'checked' : '';

    this.element.innerHTML = `
      <label class="toggle__label">
        <input class="toggle__input" type="checkbox" ${checked} />
        <div class="toggle__outer">
          <div class="toggle__inner"></div>
        </div>
        <span class="toggle__text">Snap to grid</span>
      </label>
    `;

    this.element.querySelector('input').addEventListener('change', this.handleToggle);
  }
}

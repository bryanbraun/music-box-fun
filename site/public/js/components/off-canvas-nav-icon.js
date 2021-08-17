import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';

export class OffCanvasNavIcon extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#off-canvas-nav-icon')
    });
  }

  handleClick() {
    const newFocusState = musicBoxStore.state.appState.offCanvasSidebarFocused === 'left' ? 'none' : 'left';
    musicBoxStore.setState('appState.offCanvasSidebarFocused', newFocusState);
  }

  render() {
    this.element.innerHTML = `
      <button>
        <svg width="24" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g class="icon-dark-fill">
            <rect width="24" height="4" rx="2"/>
            <rect y="8" width="24" height="4" rx="2"/>
            <rect y="16" width="24" height="4" rx="2"/>
          </g>
        </svg>
      </button>
    `;

    this.element.querySelector('button').addEventListener('click', this.handleClick);
  }
}

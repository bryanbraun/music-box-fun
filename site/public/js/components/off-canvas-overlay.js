import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import classNames from '../vendor/classnames.js';

export class OffCanvasOverlay extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'appState.offCanvasSidebarFocused',
      element: document.querySelector('#off-canvas-overlay')
    });

    // We set this in the constructor because the the event doesn't get destroyed on re-render.
    this.element.addEventListener('click', () => musicBoxStore.setState('appState.offCanvasSidebarFocused', 'none'));
  }

  render() {
    this.element.className = classNames('off-canvas-overlay', {
      'is-active': musicBoxStore.state.appState.offCanvasSidebarFocused !== 'none'
    });
  }
}

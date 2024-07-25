import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import classNames from '../vendor/classnames.js';

export class RightSidebar extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'appState.offCanvasSidebarFocused',
      element: document.querySelector('#right-sidebar')
    });
  }

  render() {
    this.element.className = classNames('right-sidebar', {
      'on-canvas': musicBoxStore.state.appState.offCanvasSidebarFocused === 'right'
    });
  }
}

import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import classNames from '../vendor/classnames.js';

export class LeftSidebar extends MBComponent {
  constructor(props) {
    super({
      renderTrigger: 'appState.offCanvasSidebarFocused',
      element: document.querySelector('#left-sidebar')
    });
  }

  render() {
    this.element.className = classNames('left-sidebar', {
      'on-canvas': musicBoxStore.state.appState.offCanvasSidebarFocused === 'left'
    });
  }
}

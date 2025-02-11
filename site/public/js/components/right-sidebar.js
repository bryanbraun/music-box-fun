import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import classNames from '../vendor/classnames.js';
import './modal.js';

export class RightSidebar extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'appState.offCanvasSidebarFocused',
      element: document.querySelector('#right-sidebar')
    });
    this.setupInfoButton();
  }

  setupInfoButton() {
    const infoButton = document.createElement('button');
    infoButton.className = 'info-button';
    infoButton.setAttribute('aria-label', 'Show information');
    infoButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;

    const modal = document.createElement('music-box-modal');
    modal.innerHTML = `
      <h2>About Music Box Fun</h2>
      <p>Music Box Fun is a web-based tool for creating, sharing, and playing music box songs.</p>
      <p>Use the grid to place notes, then press play to hear your creation!</p>
      <p>For more information, check out our <a href="/guides">guides</a>.</p>
    `;

    infoButton.addEventListener('click', () => {
      modal.open();
    });

    this.element.appendChild(infoButton);
    this.element.appendChild(modal);
  }

  render() {
    this.element.className = classNames('right-sidebar', {
      'on-canvas': musicBoxStore.state.appState.offCanvasSidebarFocused === 'right'
    });
  }
}

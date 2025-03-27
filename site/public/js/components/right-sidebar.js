import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import classNames from '../vendor/classnames.js';

export class RightSidebar extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'appState.offCanvasSidebarFocused',
      element: document.querySelector('#right-sidebar')
    });
    
    this.setupModal();
    this.setupInfoButton();
  }

  setupModal() {
    this.modal = document.querySelector('music-box-modal');
    this.modal.innerHTML = `
      <h2>About Music Box Fun</h2>
      <p>Create and share your own custom music box songs!</p>
      <p>Click the notes to add them to your song, then press play to hear how it sounds.</p>
    `;
  }

  setupInfoButton() {
    this.infoButton = document.createElement('button');
    this.infoButton.className = 'info-button';
    this.infoButton.setAttribute('aria-label', 'Show information');
    this.infoButton.innerHTML = '?';
    this.element.appendChild(this.infoButton);

    this.infoButton.addEventListener('click', () => {
      this.modal.setAttribute('open', '');
    });
  }

  render() {
    this.element.className = classNames('right-sidebar', {
      'on-canvas': musicBoxStore.state.appState.offCanvasSidebarFocused === 'right'
    });
  }
}

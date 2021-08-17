import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';

export class PageTitle extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState.songTitle',
      element: document.querySelector('title')
    })
  }

  render() {
    const songTitle = musicBoxStore.state.songState.songTitle;

    // Use textContent to be extra safe in preventing XSS issues.
    this.element.textContent = songTitle ? `${songTitle} | Music Box Fun` : `Music Box Fun - Online Music Box Maker`;
  }
}

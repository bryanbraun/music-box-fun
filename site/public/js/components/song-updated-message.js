import { MBComponent } from '../music-box-component.js';

export class SongUpdatedMessage extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState*',
      element: document.querySelector('#song-updated-message')
    });

    this.timeoutId = null;
  }

  showSongUpdatedMessage() {
    const FADE_DELAY = 2000;

    // Clear any existing fade timers
    clearTimeout(this.timeoutId);

    this.element.classList.add('song-updated'); // Just in case it's absent
    this.element.classList.remove('song-updated--hidden');

    // Set a new fade timer
    this.timeoutId = setTimeout(() => {
      this.element.classList.add('song-updated--hidden');
    }, FADE_DELAY);
  }

  // We don't call this render() on initial page load because it would
  // show the message, which is hidden by default. See main.js for details.
  render() {
    this.element.innerHTML = 'Song link updated';

    this.showSongUpdatedMessage();
  }
}

import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class SongUpdatedMessage extends Component {
  constructor() {
    super({
      renderTrigger: 'songState',
      element: document.querySelector('#updated-message')
    });

    this.initialRender = true;
  }

  showSongUpdatedMessage() {
    const FADE_DELAY = 2000;

    this.element.classList.remove('song-updated--hidden');

    window.setTimeout(() => {
      this.element.classList.add('song-updated--hidden');
    }, FADE_DELAY);
  }

  // We don't call this render() on initial page load because it would
  // show the message, which is hidden by default. See main.js for details.
  render() {
    this.element.innerHTML = `
        <span class="song-updated__message">Song link updated</span>
        <button class="song-updated__details question-icon"></button>
    `;

    this.showSongUpdatedMessage();
  }
}

import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class SongUpdatedMessage extends Component {
  constructor() {
    super({
      renderTrigger: 'songState',
      element: document.querySelector('#saved-message')
    });

    this.initialRender = true;
  }

  showSongUpdatedMessage() {
    this.element.classList.remove('song-updated--hidden');

    // We rapidly hide & unhide the message, letting CSS transitions
    // define the delays and fade out times.
    window.setTimeout(() => {
      this.element.classList.add('song-updated--hidden');
    }, 5);
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

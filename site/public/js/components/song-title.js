import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export class SongTitle extends MBComponent {
  constructor() {
    super({
      // A workaround that allows rerenders for new songs, without needing to make this a controlled component.
      // (it would be more accurate to use songState.songTitle, but that would "control" this component)
      renderTrigger: 'songState',

      element: document.querySelector('#song-title')
    });
  }

  handleInput(event) {
    musicBoxStore.setState('songState.songTitle', event.target.value);
  }

  render() {
    this.element.innerHTML = `
      <input
        type="text"
        placeholder="Untitled Song"
        value="${escapeHtml(musicBoxStore.state.songState.songTitle)}"
        maxlength="140"
      />
    `;

    this.element.addEventListener('input', this.handleInput);
  }
}

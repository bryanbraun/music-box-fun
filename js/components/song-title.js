import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class SongTitle extends Component {
  constructor() {
    super({
      element: document.querySelector('#song-title')
    });
  }

  handleInput(event) {
    musicBoxStore.setState('songState.songTitle', event.target.value);
  }

  render() {
    this.element.innerHTML = `
      <input type="text" placeholder="Untitled Song" maxlength="140" />
    `;

    // Set the input value directly to remove the possibility of XSS issues.
    this.element.querySelector('input').value = musicBoxStore.state.songState.songTitle;
    this.element.addEventListener('input', this.handleInput);
  }
}

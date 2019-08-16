import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class SongTitle extends Component {
  constructor() {
    super({
      element: document.querySelector('#song-title')
    });
  }

  render() {
    console.log('SongTitle got rendered');

    this.element.innerHTML = `
      <input type="text" placeholder="Untitled Song" value="${musicBoxStore.state.songState.songTitle}" />
    `;

    this.element.addEventListener('input', event => {
      musicBoxStore.dispatch('changeTitle', event.target.value);
    });
  }
}

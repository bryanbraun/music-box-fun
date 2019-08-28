import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class PageTitle extends Component {
  constructor() {
    super({
      renderTrigger: 'songState.songTitle',
      element: document.querySelector('title')
    })
  }

  render() {
    const songTitle = musicBoxStore.state.songState.songTitle;
    this.element.innerHTML = songTitle ? `${songTitle} | Music Box Fun` : `Music Box Fun`;
  }
}

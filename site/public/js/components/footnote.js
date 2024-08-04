import classNames from '../vendor/classnames.js'
import { musicBoxStore } from '../music-box-store.js';
import { MBComponent } from '../music-box-component.js';
import { isSilentNotePresentInSong } from '../common/notes.js';
import { WAIT_FOR_STATE } from '../common/constants.js';
import { debounce } from '../utils/debounce.js';

export class Footnote extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#footnote')
    });

    musicBoxStore.subscribe("songState.songData*", debounce(this.render.bind(this), WAIT_FOR_STATE));
  }

  render() {
    this.element.className = classNames('footnote', {
      'footnote--hidden': !isSilentNotePresentInSong()
    });

    this.element.innerHTML = `
      <p>Some notes are silent because <a href="/guides/diy-music-box#important-tips-when-composing-for-a-diy-music-box" target="_blank">mechanical DIY music boxes can't play notes in close succession</a></p>
    `;
  }
}

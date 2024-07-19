import { MBComponent } from '../music-box-component.js';
import { isSilentNotePresentInSong } from '../common/notes.js';
import classNames from '../vendor/classnames.js';

export class Footnote extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState.songData*',
      element: document.querySelector('#footnote')
    });
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

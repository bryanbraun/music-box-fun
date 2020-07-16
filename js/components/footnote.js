import { Component } from '../alt-react/component.js';
import { isSilentNotePresentInSong } from '../common/silent-notes.js';

export class Footnote extends Component {
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
      <p>Some notes are silent because mechanical DIY music boxes can't play notes in close succession</p>
    `;
  }
}

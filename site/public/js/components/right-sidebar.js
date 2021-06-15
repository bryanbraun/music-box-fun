import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import classNames from '../vendor/classnames.js';

import { PlayButton } from './play-button.js';
import { NewSongButton } from './new-song-button.js';
import { MusicBoxTypeSelect } from './music-box-type-select.js';
import { Tempo } from './tempo.js';
import { SnapToGridSelect } from './snap-to-grid-select.js';
import { Footnote } from './footnote.js';

export class RightSidebar extends Component {
  constructor(props) {
    super({
      renderTrigger: 'appState.offCanvasSidebarFocused',
      element: document.querySelector('#right-sidebar')
    });
  }

  render() {
    this.element.className = classNames('right-sidebar', {
      'on-canvas': musicBoxStore.state.appState.offCanvasSidebarFocused === 'right'
    });

    this.element.innerHTML = `
      <div class="controls">
        <div id="sidebar-play-button"></div>
        <div class="controls__section">
          <div id="file"></div>
          <div id="music-box-type"></div>
          <label id="tempo" class="tempo"></label>
        </div>
        <div class="controls__section">
          <div id="snap-to"></div>
        </div>
      </div>
      <div id="footnote"></div>
    `;

    new PlayButton({ id: 'sidebar-play-button' }).render();
    new NewSongButton().render();
    new MusicBoxTypeSelect().render();
    new Tempo().render();
    new SnapToGridSelect().render();
    new Footnote().render();
  }
}

import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import classNames from '../vendor/classnames.js';

import { Description } from './description.js';
import { Search } from './search.js';
import { BrowseTabs } from './browse-tabs.js';

export class LeftSidebar extends Component {
  constructor(props) {
    super({
      renderTrigger: 'appState.offCanvasSidebarFocused',
      element: document.querySelector('#left-sidebar')
    });
  }

  render() {
    this.element.className = classNames('left-sidebar', {
      'on-canvas': musicBoxStore.state.appState.offCanvasSidebarFocused === 'left'
    });

    this.element.innerHTML = `
      <div class="title-box">
        <a class="logo-link" href="/">
          <svg class="logo icon-dark-fill" width="28" height="28" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
              <path id="a" d="M0 25.121L3 28h25V3.001L25.193 0H0z"/>
              <path id="b" d="M0 0h25v25H0z"/>
            </defs>
            <g fill="none" fill-rule="evenodd">
              <g fill-rule="nonzero">
                <use fill="#FFF" fill-rule="evenodd" xlink:href="#a"/>
                <path stroke="#000" stroke-width="1.5" d="M.75 24.801V.75h24.117l2.383 2.547V27.25H3.301L.75 24.801z"/>
              </g>
              <path d="M27 27.001L24 24" stroke="#000" stroke-width="1.5"/>
              <g fill-rule="nonzero">
                <use fill="#FFF" fill-rule="evenodd" xlink:href="#b"/>
                <path stroke="#000" stroke-width="1.5" d="M.75.75h23.5v23.5H.75z"/>
              </g>
              <path d="M19.185 16.67V4.667L8.496 6.15v11.284c-.529-.132-1.163-.114-1.806.103-1.38.464-2.262 1.632-1.966 2.606.296.976 1.654 1.389 3.034.925 1.38-.465 1.966-1.703 1.966-2.607v-9.92l8.233-1.05v8.152c-.529-.133-1.163-.114-1.807.103-1.379.464-2.261 1.632-1.966 2.606.296.976 1.654 1.389 3.035.925 1.38-.467 1.966-1.704 1.966-2.608z" fill="#000" fill-rule="nonzero"/>
            </g>
          </svg>
          <h1 class="title">Music Box Fun</h1>
        </a>
        <p class="subtitle">Make and share music box songs online.</p>
      </div>

      <div id="description" class="description"></div>
      <div id="search" class="search"></div>
      <div id="browse" class="browse"></div>

      <div class="mini-footer">
        <a href="https://www.bryanbraun.com/2019/11/02/music-box-fun/" title="About">About</a>
        <a href="https://github.com/bryanbraun/music-box-fun" title="Source code on Github">Code</a>
        <a href="https://github.com/bryanbraun/music-box-fun/projects/1" title="Planned features">Roadmap</a>
        <a href="https://twitter.com/BryanEBraun" title="Message me on Twitter">Contact</a>
      </div>
    `;

    new Description().render();
    new Search().render();
    new BrowseTabs().render();
  }
}

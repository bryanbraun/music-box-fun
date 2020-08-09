import { Component } from '../alt-react/component.js';
import { BrowseTabSharedSongs } from './browse-tab__shared.js';
import { BrowseTabSongLibrary } from './browse-tab__library.js';

export class BrowseTabs extends Component {
  constructor() {
    super({
      element: document.querySelector('#browse')
    });

    // Static nav data, that we'll use to render our tabs and content
    this.navData = [
      {
        title: "Shared Songs",
        id: "shared-songs",
        component: BrowseTabSharedSongs
      },
      {
        title: "Song Library",
        id: "song-library",
        component: BrowseTabSongLibrary
      }
    ];

    // Set default activeTab state.
    this.state.activeTab = this.navData[0].id;

    this.handleTabClick = this.handleTabClick.bind(this);
  }

  isActive(tabId) {
    return this.state.activeTab === tabId;
  }

  handleTabClick(event) {
    const clickedTabId = event.target.dataset.targetId;

    if (!clickedTabId || this.isActive(clickedTabId)) return;

    this.setState({ activeTab: clickedTabId });
  }

  render() {
    const activeNavObject = this.navData.find(navObject => this.isActive(navObject.id));
    const ActiveNavComponent = activeNavObject.component;

    this.element.innerHTML = `
      <nav id="browse__tabs" class="browse__tabs">
        <ul>
          ${this.navData.map(navItem => (`
            <li class="browse__tab ${this.isActive(navItem.id) ? 'is-active' : ''}">
              <button data-target-id="${navItem.id}">${navItem.title}</button>
            </li>
          `)).join('')}
        </ul>
      </nav>

      <div id="browse__content" class="browse__content"></div>
    `;

    // Render the active component.
    new ActiveNavComponent({ id: 'browse__content' }).render();

    // Delegated nav listener
    this.element.querySelector('#browse__tabs').addEventListener('click', this.handleTabClick);
  }
}

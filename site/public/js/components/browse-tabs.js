import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { BrowseTabFeaturedSongs } from './browse-tab__featured.js';
import { BrowseTabSongLibrary } from './browse-tab__library.js';

export class BrowseTabs extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#browse'),
      renderTrigger: 'appState.activeTab'
    });

    // Static nav data, that we'll use to render our tabs and content
    this.navData = [
      {
        title: "Song Library",
        id: "song-library",
        component: BrowseTabSongLibrary
      },
      {
        title: "Featured Songs",
        id: "featured-songs",
        component: BrowseTabFeaturedSongs
      },
    ];

    this.handleTabClick = this.handleTabClick.bind(this);
  }

  isActive(tabId) {
    return musicBoxStore.state.appState.activeTab === tabId;
  }

  handleTabClick(event) {
    const clickedTabId = event.target.dataset.targetId;

    if (!clickedTabId || this.isActive(clickedTabId)) return;

    musicBoxStore.setState('appState.activeTab', clickedTabId);
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

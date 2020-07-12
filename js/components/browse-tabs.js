import { Component } from '../alt-react/component.js';
import { BrowseTabRecent } from './browse-tab__recent.js';
import { BrowseTabFeatured } from './browse-tab__featured.js';

export class BrowseTabs extends Component {
  constructor() {
    super({
      element: document.querySelector('#browse')
    });

    // Static nav data, that we'll use to render our tabs and content
    this.navData = [
      {
        title: "Recent",
        id: "recent-songs",
        component: BrowseTabRecent
      },
      {
        title: "Featured",
        id: "featured-songs",
        component: BrowseTabFeatured
      }
    ];

    this.state.activeTab = this.navData[0].id;
  }

  isActive(tabId) {
    return this.state.activeTab === tabId;
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
    this.element.querySelector('#browse__tabs').addEventListener('click', event => {
      const clickedTabId = event.target.dataset.targetId;

      if (!clickedTabId || this.isActive(clickedTabId)) return;

      this.setState({ activeTab: clickedTabId });
    });

    // Delegated song-link clicker.
    //
    // When a link to another musicboxfun song is clicked, we want to jump to the top of the page.
    // We do this with click events instead of onhashchange because otherwise we wouldn't be able
    // to discern between song-link clicks and back/forward navigation (which we don't want to jump).
    // The only case this doesn't catch is browser-bookmarked songs, which is a narrow-enough use-case
    // that I'm ok with it falling back to a non-jumping behavior.
    this.element.querySelector('#browse__content').addEventListener('click', event => {
      const clickedEl = event.target;

      if (clickedEl.tagName !== 'A') return;

      const leadingHrefChar = clickedEl.outerHTML.split('href="')[1][0];

      if (leadingHrefChar === '#') {
        window.scrollTo(0, 0);
      }
    });
  }
}

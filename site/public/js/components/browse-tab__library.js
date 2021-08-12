import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import { escapeHtml, escapeAndHighlightHtml } from '../utils/escapeHtml.js';
import { jumpToTopIfASongWasClicked } from '../common/common-event-handlers.js';
import { apiHostname, request } from '../common/api.js';

export class BrowseTabSongLibrary extends Component {
  constructor(props) {
    super({
      props,
      element: document.getElementById(props.id),
      renderTrigger: 'appState.songLibraryQuery'
    });
  }

  async fetchSongs() {
    const searchQuery = musicBoxStore.state.appState.songLibraryQuery;
    const params = searchQuery ? `?q=${searchQuery}&searchAll=true` : '';
    const songsData = {
      isError: false,
      data: []
    };

    try {
      songsData.data = await request(`${apiHostname}/v1/songs${params}`);
    } catch (error) {
      console.error(error); // Log the error without halting execution
      songsData.isError = true;
    }

    return songsData;
  }

  handleBackToBrowseClick(event) {
    musicBoxStore.setState('appState.songLibraryQuery', '');
  }

  updateMailtoLink(event) {
    const subject = 'Add%20music%20box%20song%20to%20library';
    const songUrl = document.location.href;
    const newHref = `mailto:bbraun7@gmail.com?subject=${subject}&body=%0A%0A${songUrl}`;

    event.currentTarget.href = newHref;
  }

  renderSongCreator(song) {
    let songCreator = song.creator ? escapeHtml(song.creator) : 'anonymous';
    return !song.creator_url ?
      `<span class="library-song__creator">${songCreator}</span>` :
      `<a class="library-song__creator" target="_blank" href="${song.creator_url}">${songCreator}</a>`;
  }

  renderHeader(songLibraryQuery) {
    return songLibraryQuery
      ?
        `<button id="back-to-browse-link" class="browse__back-link"><span class="back-arrow">«</span>Back to Browse</button>
         <h2 class="browse__title">Search all "${escapeHtml(songLibraryQuery)}"</h2>`
      :
        `<h2 class="browse__title">Browse Song Library</h2>`
  }

  async render() {
    const songsData = await this.fetchSongs();

    this.element.innerHTML = `
      ${this.renderHeader(musicBoxStore.state.appState.songLibraryQuery)}
      <div class="browse__songs">
        ${songsData.isError ? '<p class="browse__error">A problem occurred while trying to get songs.</p>' : `
          ${songsData.data.length === 0 ? '<p class="browse__no-results">No results found.</p>' : `
            <ul id="library-songs" class="library-songs">
              ${songsData.data.map(song => (`
                <li class="library-song">
                  <a href="#${song.data}">${escapeAndHighlightHtml(song.pg_search_highlight || song.title)}</a> by ${this.renderSongCreator(song)}
                </li>
              `)).join('')}
            </ul>
          `}
        `}
      </div>
      <p class="library-note">To add your song to the library, <a id="library-add-mailto" href="mailto:bbraun7@gmail.com?subject=Add%20music%20box%20song%20to%20library" target="_blank">email it to me</a>.</p>
    `;

    let backToBrowseLinkEl = this.element.querySelector('#back-to-browse-link');
    let songsListEl = this.element.querySelector('#library-songs');

    backToBrowseLinkEl && backToBrowseLinkEl.addEventListener('click', this.handleBackToBrowseClick);
    songsListEl && songsListEl.addEventListener('click', jumpToTopIfASongWasClicked);

    // We update the mailto link right as the user clicks the share button to ensure that it contains
    // the latest URL data. (If we try to instead rerender the link on "songState*" changes, the link
    // might update before the URL does, resulting in it putting stale data in the email).
    this.element.querySelector('#library-add-mailto').addEventListener('click', this.updateMailtoLink);
  }
}

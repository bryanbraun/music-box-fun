import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { escapeHtml, escapeAndHighlightHtml } from '../utils.js';
import { jumpToTopIfASongWasClicked } from '../common/common-event-handlers.js';
import { apiHostname, request } from '../common/api.js';

export function renderSongCreator(song) {
  let songCreator = song.creator ? escapeHtml(song.creator) : 'anonymous';
  return !song.creator_url ?
    `<span class="library-song__creator">${songCreator}</span>` :
    `<a class="library-song__creator" target="_blank" href="${song.creator_url}">${songCreator}</a>`;
};

export class BrowseTabSongLibrary extends MBComponent {
  constructor(props) {
    super({
      props,
      element: document.getElementById(props.id),
      renderTrigger: 'appState.songLibraryQuery'
    });

    this.handleBrowseSongsScroll = this.handleBrowseSongsScroll.bind(this);
    this.fetchSongs = this.fetchSongs.bind(this);
    this.nextPageUrl = null;
    this.pendingFetch = false;
  }

  async fetchSongs(apiPath) {
    let songsData = {
      isError: false,
      songs: [],
      meta: {}
    };

    try {
      this.pendingFetch = true;
      songsData = {
        ...songsData,
        ...(await request(`${apiHostname}${apiPath}`))
      };
    } catch (error) {
      console.error(error); // Log the error without halting execution
      songsData.isError = true;
    } finally {
      this.pendingFetch = false;
    }

    return songsData;
  }

  handleBackToBrowseClick() {
    musicBoxStore.setState('appState.songLibraryQuery', '');
  }

  // Scroll handler for loading more songs (infinite scroll).
  // This is only attached to the listener when we know there are more songs to load.
  async handleBrowseSongsScroll(event) {
    const SCROLL_THRESHOLD = 80;
    const browseEl = event.currentTarget;
    const scrollPercent = (browseEl.scrollTop / (browseEl.scrollHeight - browseEl.clientHeight)) * 100;

    if (scrollPercent > SCROLL_THRESHOLD && !this.pendingFetch) {
      const songsData = await this.fetchSongs(this.nextPageUrl);

      if (!songsData.isError) {
        // In the case of a success, append songs to the song list.
        const songsListEl = browseEl.querySelector('#library-songs');
        songsListEl.insertAdjacentHTML("beforeend", this.renderSongs(songsData.songs));

        const isAllSongsLoaded = !songsData.meta.next;

        if (isAllSongsLoaded) {
          browseEl.querySelector('#library-loader').remove();
          browseEl.removeEventListener('scroll', this.handleBrowseSongsScroll);
        } else {
          this.nextPageUrl = songsData.meta.next;
        }
      } else {
        // In the case of an error:
        //   - Hide loading indicator to prevent confusion.
        //   - Stop fetching more songs reduce API load.
        // The error message will be logged to console as part of this.fetchSongs().
        browseEl.querySelector('#library-loader').remove();
        browseEl.removeEventListener('scroll', this.handleBrowseSongsScroll);
      }
    }
  }

  updateMailtoLink(event) {
    const subject = 'Add music box song to library';
    const songUrl = document.location.href;
    const body = `Hello, I'd like to submit my song. Here are my details:\n\nMy name/username: <enter a username here>\nMy song link: ${songUrl}`;
    const newHref = `mailto:bbraun7@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    event.currentTarget.href = newHref;
  }

  renderHeader(songLibraryQuery) {
    return songLibraryQuery
      ?
      `<button id="back-to-browse-link" class="browse__back-link"><span class="back-arrow">«</span>Back to Browse</button>
         <h2 class="browse__title">Search all "${escapeHtml(songLibraryQuery)}"</h2>`
      :
      `<h2 class="browse__title">Browse Song Library</h2>`
  }

  renderSongs(songs) {
    return songs.map(song => (`
      <li class="library-song">
        <a href="#${song.data}">${escapeAndHighlightHtml(song.pg_search_highlight || song.title)}</a> by ${renderSongCreator(song)}
      </li>
    `)).join('');
  }

  async render() {
    const searchQuery = musicBoxStore.state.appState.songLibraryQuery;
    const apiPath = `/v1/songs${searchQuery ? `?q=${searchQuery}` : ''}`;
    const songsData = await this.fetchSongs(apiPath);

    this.nextPageUrl = songsData.meta.next;

    this.element.innerHTML = `
      ${this.renderHeader(musicBoxStore.state.appState.songLibraryQuery)}
      <div id="browse__songs" class="browse__songs">
        ${songsData.isError ? '<p class="browse__error">A problem occurred while trying to get songs.</p>' : `
          ${songsData.songs.length === 0 ? '<p class="browse__no-results">No results found.</p>' : `
            <ul id="library-songs" class="library-songs">
              ${this.renderSongs(songsData.songs)}
            </ul>
            ${songsData.meta.next ? '<div id="library-loader" class="library-loader"><img src="/images/loading.gif" alt="loading..." /></div>' : ''}
          `}
        `}
      </div>
      <p class="library-note">To add your song to the library, <a id="library-add-mailto" href="mailto:bbraun7@gmail.com?subject=Add%20music%20box%20song%20to%20library" target="_blank">email it to me</a>.</p>
    `;

    let backToBrowseLinkEl = this.element.querySelector('#back-to-browse-link');
    let songsListEl = this.element.querySelector('#library-songs');
    let browseSongsEl = this.element.querySelector('#browse__songs');

    backToBrowseLinkEl && backToBrowseLinkEl.addEventListener('click', this.handleBackToBrowseClick);
    songsListEl && songsListEl.addEventListener('click', jumpToTopIfASongWasClicked);
    this.nextPageUrl && browseSongsEl && browseSongsEl.addEventListener('scroll', this.handleBrowseSongsScroll);

    // We update the mailto link right as the user clicks the share button to ensure that it contains
    // the latest URL data. (If we try to instead rerender the link on "songState*" changes, the link
    // might update before the URL does, resulting in it putting stale data in the email).
    this.element.querySelector('#library-add-mailto').addEventListener('click', this.updateMailtoLink);
  }
}

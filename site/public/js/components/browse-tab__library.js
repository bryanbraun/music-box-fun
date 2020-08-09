import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { jumpToTopForDelegatedSongClicks } from '../common/common-event-handlers.js';

export class BrowseTabSongLibrary extends Component {
  constructor(props) {
    super({
      props,
      element: document.getElementById(props.id)
    });
  }

  async fetchSongs() {
    const response = await fetch('http://0.0.0.0:3000/v1/songs');

    return response.json();
  }

  renderSongCreator(song) {
    let songCreator = song.creator ? escapeHtml(song.creator) : 'anonymous';
    return !song.creator_url ?
      `<span class="library-song__creator">${songCreator}</span>` :
      `<a class="library-song__creator" target="_blank" href="${song.creator_url}">${songCreator}</a>`;
  }

  async render() {
    const songsData = await this.fetchSongs();

    this.element.innerHTML = `
      <h2 class="browse__title">Song Library</h2>
      <div class="browse__songs">
        <ul class="library-songs">
          ${songsData.map(song => (`
            <li class="library-song">
              <a href="#${song.data}">${escapeHtml(song.title)}</a> by ${this.renderSongCreator(song)}
            </li>
          `)).join('')}
        </ul>
        <p class="library-note">To add your song to the library, just <a href="mailto:bbraun7@gmail.com" target="_blank">email me</a>.</p>
      </div>
    `;

    this.element.querySelector('.library-songs').addEventListener('click', jumpToTopForDelegatedSongClicks);
  }
}

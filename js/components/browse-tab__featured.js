import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export class BrowseTabFeatured extends Component {
  constructor(props) {
    super({
      props,
      element: document.getElementById(props.id)
    });
  }

  async fetchFeaturedSongs() {
    const response = await fetch('/data/featured-songs.json');

    return response.json();
  }

  async render() {
    const featuredSongsData = await this.fetchFeaturedSongs();

    this.element.innerHTML = `
      <h2 class="browse__title">Featured Songs</h2>
      <div class="browse__songs">
        <ul class="featured-songs">
          ${featuredSongsData.map(song => (`
            <li class="featured-song">
              <a href="${song.url}">${escapeHtml(song.title)}</a> by
              <a class="featured-song__creator" target="_blank" href="${song.creator_url}">${escapeHtml(song.creator)}</a>
            </li>
          `)).join('')}
        </ul>
        <p class="featured-note">To get your song listed here, just <a href="mailto:bbraun7@gmail.com" target="_blank">email me</a>.</p>
      </div>
    `;
  }
}

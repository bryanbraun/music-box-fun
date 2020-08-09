import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { jumpToTopForDelegatedSongClicks } from '../common/common-event-handlers.js';


export class Search extends Component {
  constructor(props) {
    super({
      element: document.querySelector('#search')
    });

    this.state.queryString = '';
    this.state.searchResults = [];
    this.state.isResultsContainerVisible = false;

    this.handleInput = this.handleInput.bind(this);
    this.handleSearchResultClick = this.handleSearchResultClick.bind(this);
    this.setInnerHtmlWithControlledInput = this.setInnerHtmlWithControlledInput.bind(this);
  }

  async fetchSearchResults(searchString) {
    const response = await fetch(`http://0.0.0.0:3000/v1/songs?q=${searchString}`);
    return response.json();
  }

  async handleInput(event) {
    if (event.target.value) {
      this.setState({
        queryString: event.target.value,
        isResultsContainerVisible: true
      });
    } else {
      this.setState({
        queryString: event.target.value,
        isResultsContainerVisible: false
      });
    }

    const results = await this.fetchSearchResults(event.target.value);

    this.setState({ searchResults: results });

    // @todo: add error handling.
  }

  handleSearchResultClick(event) {
    this.setState({
      queryString: '',
      isResultsContainerVisible: false
    });

    // Note: this doesn't add a listener... it just jumps if the clicked
    // thing was a song. I may want to rename this to make that more clear.
    jumpToTopForDelegatedSongClicks(event);
  }

  // In order to make this controlled component work smoothly, I need to manually replace the
  // cursor whenever I rerender the field. For now, I'll try this as a one-off, but if I need
  // to do this multiple times, I could abstract it into a utility or part of the alt-react framework.
  setInnerHtmlWithControlledInput(templateString, inputSelector) {
    const oldInputEl = this.element.querySelector(inputSelector);
    const cursorPosition = oldInputEl.selectionStart;

    this.element.innerHTML = templateString;

    const newInputEl = this.element.querySelector(inputSelector);
    newInputEl.focus();
    newInputEl.setSelectionRange(cursorPosition, cursorPosition);
  }

  render() {
    const resultsVisibilityClass = this.state.isResultsContainerVisible ? '' : 'is-hidden';

    this.setInnerHtmlWithControlledInput(`
      <form id="search__form" class="search__form">
        <label for="search__field" class="visuallyhidden">Search Song Library</label>
        <input
          type="search"
          id="search__field"
          class="search__field"
          aria-label="Search song library"
          placeholder="Search Song Library"
          autocomplete="off"
          required
          value="${escapeHtml(this.state.queryString)}"
        >
        <button type="submit" class="search__button">
          <svg viewBox="0 0 32 32" width="100%" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#000" stroke-width="2" fill="none" fill-rule="evenodd">
              <circle cx="12" cy="12" r="9"/>
              <path d="M19 19l10.159 10.159" stroke-linecap="square"/>
            </g>
          </svg>
        </button>
      </form>
      <div id="search__results" class="search__results-container ${resultsVisibilityClass}">
        <ul class="search__results">
          <li>
            <button class="search__result search-all-button">
              Search all "${escapeHtml(this.state.queryString)}"
            </button>
          </li>
          ${this.state.searchResults.map(song => (`
            <li>
              <a class="search__result" href="#${song.data}">${escapeHtml(song.title)}</a>
            </li>
          `)).join('')}
        </ul>
      </div>
    `, `#search__field`);

    this.element.addEventListener('input', this.handleInput);
    this.element.querySelector('#search__results').addEventListener('click', this.handleSearchResultClick);
  }
}

import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import { escapeHtml, escapeAndHighlightHtml } from '../utils/escapeHtml.js';
import { jumpToTopIfASongWasClicked } from '../common/common-event-handlers.js';
import { apiHostname, request } from '../common/api.js';
import { onClickOutside } from '../common/on-click-outside.js';

export class Search extends Component {
  constructor(props) {
    super({
      element: document.querySelector('#search')
    });

    this.state.queryString = '';
    this.state.searchResults = [];
    this.state.isResultsContainerVisible = false;

    this.handleInput = this.handleInput.bind(this);
    this.handleSearchFormSubmit = this.handleSearchFormSubmit.bind(this);
    this.handleSearchResultClick = this.handleSearchResultClick.bind(this);
    this.handleClickOutsideOfSearchResults = this.handleClickOutsideOfSearchResults.bind(this);
    this.setInnerHtmlWithControlledInput = this.setInnerHtmlWithControlledInput.bind(this);

    onClickOutside('#search__results', this.handleClickOutsideOfSearchResults);
  }

  async handleInput(event) {
    const queryString = event.target.value;
    let searchResults;

    if (queryString) {
      this.setState({
        queryString,
        isResultsContainerVisible: true
      });
    } else {
      this.setState({
        queryString,
        isResultsContainerVisible: false
      });
    }

    // setState above re-renders the component, which makes the input lose focus.
    // Since we are in handleInput, we know the user is actively typing, so we
    // want to manually restore focus to the search input. We do this here, as
    // well as below, when the component re-renders after the API response arrives.
    this.element.querySelector('#search__field').focus();

    try {
      searchResults = await request(`${apiHostname}/v1/songs?q=${queryString}`);
    } catch(error) {
      console.error(error);
      searchResults = [];
    }

    this.setState({ searchResults });

    this.element.querySelector('#search__field').focus();
  }

  handleClickOutsideOfSearchResults(event) {
    if (this.state.isResultsContainerVisible === true) {
      this.setState({
        isResultsContainerVisible: false,
        searchResults: []
      });
    }
  }

  handleSearchResultClick(event) {
    this.setState({
      queryString: '',
      isResultsContainerVisible: false
    });

    jumpToTopIfASongWasClicked(event);
  }

  handleSearchFormSubmit(event) {
    event.preventDefault();

    musicBoxStore.setState('appState.songLibraryQuery', this.state.queryString);
    musicBoxStore.setState('appState.activeTab', 'song-library');

    this.setState({
      queryString: '',
      isResultsContainerVisible: false
    });
  }

  // In order to make this controlled component work smoothly, I need to manually replace the
  // cursor whenever I re-render the field. For now, I'll try this as a one-off, but if I need
  // to do this multiple times, I could abstract it into a utility or part of the alt-react framework.
  setInnerHtmlWithControlledInput(templateString, controlledInputSelector) {
    const oldInputEl = this.element.querySelector(controlledInputSelector);
    const cursorPosition = oldInputEl ? oldInputEl.selectionStart : 0;

    this.element.innerHTML = templateString;

    const newInputEl = this.element.querySelector(controlledInputSelector);
    newInputEl.setSelectionRange(cursorPosition, cursorPosition);
  }

  // We apply some search results box styles dynamically, to constrain the box to the visible screen.
  getSearchResultsStyles() {
    const searchResultsEl = this.element.querySelector('#search__results');

    if (!searchResultsEl) return '';

    return `--search-results-distance-from-top-of-screen: ${searchResultsEl.getBoundingClientRect().top}px;`;
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
        <button type="submit" class="search__button" aria-label="Search Button">
          <svg viewBox="0 0 32 32" width="100%" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#000" stroke-width="2" fill="none" fill-rule="evenodd">
              <circle cx="12" cy="12" r="9"/>
              <path d="M19 19l10.159 10.159" stroke-linecap="square"/>
            </g>
          </svg>
        </button>
      </form>
      <div id="search__results" class="search__results-container ${resultsVisibilityClass}" style="${this.getSearchResultsStyles()}">
        <button id="search-all" class="search__result search-all-button">
          Search all "${escapeHtml(this.state.queryString)}"
        </button>
        <ul class="search__results">
          ${this.state.searchResults.map(song => (`
            <li>
              <a class="search__result" href="#${song.data}">${escapeAndHighlightHtml(song.pg_search_highlight)}</a>
            </li>
          `)).join('')}
        </ul>
      </div>
    `, `#search__field`);

    this.element.addEventListener('input', this.handleInput);
    this.element.querySelector('#search__form button[type="submit"]').addEventListener('click', this.handleSearchFormSubmit);
    this.element.querySelector('#search-all').addEventListener('click', this.handleSearchFormSubmit);
    this.element.querySelector('#search__results ul').addEventListener('click', this.handleSearchResultClick);
  }
}

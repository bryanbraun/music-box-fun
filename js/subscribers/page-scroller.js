import { musicBoxStore } from '../music-box-store.js';

export const pageScroller = {
  timeoutId: null,

  // We use a recursive setTimeout so we could change the time value dynamically
  // (see https://stackoverflow.com/a/1280279/1154642). We need to bind to `this`
  // because setTimeout makes `this` the window object by default (see
  // https://javascript.info/bind).
  startScrolling() {
    const millisecondsPerChange = 10;
    const END_OF_PAGE_BUFFER = 3;
    const isFullyScrolled =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight -
      document.documentElement.scrollTop <= END_OF_PAGE_BUFFER;

    if (isFullyScrolled) {
      musicBoxStore.setState('appState.isScrolling', false);
      return // return early so we don't create a new timeout while exiting this function.
    }

    window.scrollBy(0, 1);
    this.timeoutId = window.setTimeout(this.startScrolling.bind(this), millisecondsPerChange);
  },

  toggleScrolling() {
    if (musicBoxStore.state.appState.isScrolling) {
      this.startScrolling(); // Play
    } else {
      clearTimeout(this.timeoutId); // Pause
    }
  },

  subscribeToScrollState() {
    musicBoxStore.subscribe('appState.isScrolling', this.toggleScrolling.bind(this));
  }
}

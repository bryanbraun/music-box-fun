import { musicBoxStore } from '../music-box-store.js';

export const pageScroller = {
  timeoutId: null,

  // We use a recursive setTimeout so we can change the time value dynamically
  // (see https://stackoverflow.com/a/1280279/1154642). We need to bind to `this`
  // because setTimeout makes `this` the window object by default (see
  // https://javascript.info/bind).
  startScrolling() {
    const millisecondsPerChange = 10 + -musicBoxStore.state.songState.playSpeed;
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
    musicBoxStore.events.subscribe('isScrolling', this.toggleScrolling.bind(this));
  }
}

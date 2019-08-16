import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

// A simple non-visual component that starts/stops page scrolling when the play state is toggled
export class PageScroll extends Component {
  constructor() {
    super({
      renderTrigger: 'isScrolling',
    });

    this.timeoutId = null;
    this.initialLoad = true;
    this.startScrolling = this.startScrolling.bind(this);
  }

  startScrolling() {
    const millisecondsPerChange = 10 + -musicBoxStore.state.songState.playSpeed;
    window.scrollBy(0, 1);
    this.timeoutId = window.setTimeout(this.startScrolling, millisecondsPerChange);
  };

  render() {
    // Do nothing on the initial render().
    if (this.initialLoad === true) {
      this.initialLoad = false;
      return;
    }

    if (musicBoxStore.state.appState.isScrolling) {
      this.startScrolling(); // Play
    } else {
      clearTimeout(this.timeoutId); // Pause
    }
  }
}

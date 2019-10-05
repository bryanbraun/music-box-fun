import { musicBoxStore } from '../music-box-store.js';

/* Page Scroller

We've gone through several iterations of this code:

1. Scroll on a `setInterval`.

  This seem to work, but you couldn't change the tempo while it was playing. There were probably
  other issues that I didn't notice, because I didn't use this solution for long.

2. Scroll during a recursive `setTimeout`.

  This allowed us to change the tempo while it was playing, but I started to notice some issues:
  - A 10ms recursive setTimeout would actually fire closer to 13 ms, with +- 2 ms, under good
    conditions (and more variation under bad conditions).
  - A recent Safari update broke scroll behavior under this system. A 10ms recursive setTimeout
    could vary anywhere from 9ms to 40ms, making play speed slow, inconsistent, and unusable.

3. Scroll on `requestAnimationFrame`.

  On play, we created a math function plotting our expected positions over time, and scrolled
  to whichever location matched each timestamp.
  - This improved the consistency of the scroll speed in all browsers
  - The scroll rate on Safari is much better, though note-playing still feels a little inconsistent.
  - Note sound quality on Safari seems like it begins degrading part-way through the song. Not sure why.
  - Granular tempos are still possible. Apparently, browsers can scrollTo with sub-pixel precision.
  - You cannot scroll mid-song... it jumps back to the planned position without missing a beat.

  Possible future ideas:
  - Trigger scrolling on the web-audio timer somehow?
  - Place some activities into a background worker? Like intersection observer and playing notes?
*/
export const pageScroller = {
  startTime: null,
  getTargetScrollTop: null,

  BpmToPixelsPerMillisecond(bpm) {
    const PIXELS_PER_BEAT = 50;
    const MS_PER_MINUTE = 60000;

    return bpm * PIXELS_PER_BEAT / MS_PER_MINUTE;
  },

  scrollPage(timestamp) {
    const END_OF_PAGE_BUFFER = 3;
    const BEATS_PER_MINUTE = 110;
    const scrollRate = this.BpmToPixelsPerMillisecond(BEATS_PER_MINUTE);
    const newElapsedTime = timestamp - this.startTime;
    const isFullyScrolled =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight -
      document.documentElement.scrollTop <= END_OF_PAGE_BUFFER;

    if (isFullyScrolled) {
      musicBoxStore.setState('appState.isScrolling', false);
    }

    if (!musicBoxStore.state.appState.isScrolling) {
      this.startTime = null;
      return;
    }

    // First iteration set-up
    if (!this.startTime) {
      const initialScrollTop = document.documentElement.scrollTop;

      this.startTime = timestamp;
      this.getTargetScrollTop = (elapsedTime) => scrollRate * elapsedTime + initialScrollTop; // y = mx+b
    }

    window.scrollTo(0, this.getTargetScrollTop(newElapsedTime));

    requestAnimationFrame(this.scrollPage.bind(this));
  },

  toggleScrolling() {
    if (musicBoxStore.state.appState.isScrolling) {
      this.scrollPage(performance.now());
    }

    // If the appState was set to isScrolling: false, we don't need to do anything
    // because the play loop checks this state value and will exit automatically.
  },

  subscribeToScrollState() {
    musicBoxStore.subscribe('appState.isScrolling', this.toggleScrolling.bind(this));
  }
}

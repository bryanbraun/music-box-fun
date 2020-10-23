import { musicBoxStore } from '../music-box-store.js';
import { QUARTER_BAR_GAP } from '../common/constants.js';

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

4. Scroll with `requestAnimationFrame` but play audio with ToneJS.

  This uses the same basic scrolling logic in 3, but we disable the observers from playing notes while
  the play button is enabled. Instead we feed the audio data into ToneJS and it plays the notes as part
  of the WebAudio scheduler while we run the requestAnimationFrame scrolling at the same position & speed.

*/
export const pageScroller = {
  BpmToPixelsPerMillisecond(bpm) {
    const PIXELS_PER_BEAT = QUARTER_BAR_GAP; // 48
    const MS_PER_MINUTE = 60000;

    return (bpm * PIXELS_PER_BEAT) / MS_PER_MINUTE;
  },

  startScrolling() {
    if (!musicBoxStore.state.appState.isPlaying) return;

    const END_OF_PAGE_BUFFER = 3;
    const beatsPerMinute = musicBoxStore.state.songState.tempo;
    const scrollRate = this.BpmToPixelsPerMillisecond(beatsPerMinute);
    const initialScrollTop = document.documentElement.scrollTop;
    const getTargetScrollTop = (elapsedTime) => scrollRate * elapsedTime + initialScrollTop;

    let startTime;

    requestAnimationFrame(function(timestamp) {
      startTime = timestamp;
      scrollPage(timestamp);
    });

    function scrollPage(timestamp) {
      // Cease scrolling if the song has been paused.
      if (!musicBoxStore.state.appState.isPlaying) return;

      const isFullyScrolled =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight -
        document.documentElement.scrollTop <= END_OF_PAGE_BUFFER;

      if (isFullyScrolled) {
        musicBoxStore.setState('appState.isPlaying', false);
      }

      window.scrollTo(0, getTargetScrollTop(timestamp - startTime));

      requestAnimationFrame(scrollPage);
    }
  },

  subscribeToPlayState() {
    musicBoxStore.subscribe('appState.isPlaying', this.startScrolling.bind(this));
  }
}

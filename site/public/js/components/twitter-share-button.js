import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';

// This uses the Twitter intents API to create a customized twitter share button.
export class TwitterShareButton extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#twitter-share')
    });

    this.updateShareMetadata = this.updateShareMetadata.bind(this);
  }

  // This code was borrowed from 'Ridiculously Responsive Social Sharing Buttons' (RRSSB). It
  // recursively decodes the string first, to ensure we aren't double encoding. See the original context:
  // https://github.com/kni-labs/rrssb/blob/270f9273321c86c8d7193a7978727bad3d81ff15/js/rrssb.js#L106
  encodeString(string) {
    if (string !== undefined && string !== null) {
      if (string.match(/%[0-9a-f]{2}/i) !== null) {
        string = decodeURIComponent(string);
        encodeString(string);
      } else {
        return encodeURIComponent(string);
      }
    }
  }

  updateShareMetadata(event) {
    const songTitle = this.encodeString(musicBoxStore.state.songState.songTitle || 'Untitled Song');
    const songUrl = this.encodeString(document.location.href);
    const newHref = `https://twitter.com/intent/tweet?text=${songTitle}%0A${songUrl}%0A%E2%80%93&related=musicboxfun`;

    event.currentTarget.href = newHref;
  }

  render() {
    this.element.innerHTML = `
      <a class="share-button twttr-share-button" href="https://twitter.com/intent/tweet?text=%0A&related=musicboxfun">
        <i class="share-icon"></i>
        <span class="share-text">Share this song</span>
      </a>
    `;

    // We update the share metadata right as the user clicks the share button to ensure that it shares
    // the latest data. (Previously, we updated the metadata on "songState*" changes, but often, this
    // twitter-share-button component would update before the URL did, resulting in sharing stale data).
    this.element.querySelector('.share-button').addEventListener('click', this.updateShareMetadata);
  }
}

import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

// This uses the Twitter intents API to create a customized twitter share button. The pop-up is
// powered by the same Twitter Javascript that loads the timeline. It detects the href value of
// my button and adds an event listener to the document.
export class TwitterShareButton extends Component {
  constructor(props) {
    super({
      renderTrigger: 'songState',
      element: document.querySelector('#twitter-share')
    });
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

  render() {
    const songTitle = this.encodeString(musicBoxStore.state.songState.songTitle || 'Untitled Song');
    const songUrl = this.encodeString(document.location.href);

    this.element.innerHTML = `
      <a class="share-button" href="https://twitter.com/intent/tweet?text=${songTitle}%0A${songUrl}&related=musicboxfun">
        <i></i>
        Share this song
      </a>
    `;
  }
}

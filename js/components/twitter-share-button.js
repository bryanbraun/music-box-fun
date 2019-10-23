import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class TwitterShareButton extends Component {
  constructor(props) {
    super({
      renderTrigger: 'state',
      element: document.querySelector('#twitter-share__updated')
    });
  }

  render() {
    this.element.innerHTML = `
      <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-size="large"
        data-text="${musicBoxStore.state.songState.songTitle || 'Untitled Song'}" data-url="${document.location.href}"
        data-related="musicboxfun" data-dnt="true" data-show-count="false"></a>
    `;

    window.twttr.widgets.load(this.element);
  }
}

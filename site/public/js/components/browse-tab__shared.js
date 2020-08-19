import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';

export class BrowseTabSharedSongs extends Component {
  constructor(props) {
    super({
      props,
      element: document.getElementById(props.id)
    });
  }

  render() {
    this.element.innerHTML = `
      <h2 class="browse__title">Shared Songs on Twitter</h2>
      <a
        class="twitter-timeline"
        data-width="232"
        data-height="100"
        data-dnt="true"
        data-chrome="noheader nofooter transparent"
        href="https://twitter.com/MusicBoxFun?ref_src=twsrc%5Etfw"
      >
        Shared on Twitter
      </a>
    `;

    // For details, see https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-loading-and-initialization
    // and https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/javascript-api .
    //
    // Note: we bind 'this' so we can call this.props.id from within the callback.
    window.twttr.ready((function(twttr) {
      twttr.widgets.load(document.getElementById(this.props.id));
    }).bind(this));
  }
}

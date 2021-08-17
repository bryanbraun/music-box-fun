
import { MBComponent } from '../music-box-component.js';

export class SongLinkButton extends MBComponent {
  constructor(props) {
    super({
      element: document.querySelector('#song-link')
    });

    this.defaultButtonText = 'Copy song link';
    this.state.buttonText = this.defaultButtonText;

    this.copySongLinkToClipboard = this.copySongLinkToClipboard.bind(this);
  }

  async copySongLinkToClipboard() {
    const songLink = document.location.href;

    try {
      // Note: we wrap this in 'try' because a few things could cause failure (though, unlikely in prod).
      //   1. If the page isn't loaded over SSL, navigator.clipboard will be undefined.
      //   2. Browser incompatibility (like IE 11).
      await navigator.clipboard.writeText(songLink);

      this.setState({ buttonText: 'Copied!' });

      setTimeout(() => {
        this.setState({ buttonText: this.defaultButtonText });
      }, 2000);
    } catch(error) {
      if (!navigator.clipboard) {
        console.error("Error: navigator.clipboard is undefined. This can happen if the site isn't being served over https.");
      } else {
        console.error("Error", error);
      }

      this.setState({ buttonText: "Couldn't copy :(" });

      setTimeout(() => {
        this.setState({ buttonText: this.defaultButtonText });
      }, 2000);
    }
  }

  render() {
    this.element.innerHTML = `
      <button class="share-button song-link-button">
        <svg width="13" height="17" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <path d="M0 0h14v18H0z"/>
            <path d="M9 0H0v13h1V1h8V0zm4 3H3v14h10V3zm-1 13H4V4h8v12z" fill="#000" fill-rule="nonzero"/>
          </g>
        </svg>
        <span class="share-text">${this.state.buttonText}</span>
      </button>
    `;

    this.element.querySelector('.song-link-button').addEventListener('click', this.copySongLinkToClipboard);
  }
}

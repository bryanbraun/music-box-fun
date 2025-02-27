import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';

export class ShareButton extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#share-button')
    });
  }

  updateEmailShareLink(event) {
    const subject = musicBoxStore.state.songState.songTitle || 'Untitled Song';
    const songUrl = document.location.href;
    const newHref = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(songUrl)}`;

    if (event) {
      event.currentTarget.href = newHref;
    } else {
      return newHref;
    }
  }

  handleWebShareClick() {
    navigator.share({
      title: musicBoxStore.state.songState.songTitle || 'Untitled Song',
      url: document.location.href
    });
  }

  render() {
    const isWebShareSupported = navigator.share !== undefined;
    const emailShareLink = this.updateEmailShareLink();

    this.element.innerHTML = isWebShareSupported ? `
      <button class="web-share-button share-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14">
          <path fill="#000" d="M6.5 1a.5.5 0 0 1 .09.992L6.5 2h-3a1.5 1.5 0 0 0-1.493 1.356L2 3.5v8a1.5 1.5 0 0 0 1.356 1.493L3.5 13h8a1.5 1.5 0 0 0 1.493-1.356L13 11.5v-1a.5.5 0 0 1 .992-.09l.008.09v1a2.5 2.5 0 0 1-2.336 2.495L11.5 14h-8a2.5 2.5 0 0 1-2.495-2.336L1 11.5v-8a2.5 2.5 0 0 1 2.336-2.495L3.5 1zm3.878-.422c0-.448.461-.703.816-.516l.074.047.062.053 4.497 4.42a.588.588 0 0 1 .107.688l-.05.08-.057.065-4.497 4.423a.558.558 0 0 1-.929-.247l-.018-.087-.005-.082v-2.096l-.258.023a7.669 7.669 0 0 0-.742.117c-1.534.318-3.014 1.112-4.445 2.39-.39.348-.992.02-.928-.506.486-3.988 2.482-6.23 5.884-6.602l.264-.025.225-.015zm1 1.033v2.032l-1.152.077c-1.573.126-2.734.674-3.563 1.569-.669.721-1.178 1.728-1.476 3.067 1.415-1.061 2.91-1.726 4.487-1.958l.348-.044 1.356-.122v2.156L14.824 5z"/>
        </svg>
        <span class="share-text">Share this song</span>
      </button>
      <a class="email-share-button share-button" href="${emailShareLink}" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none">
          <rect width="13" height="9" x=".5" y="2.5" stroke="#000" rx=".5"/>
          <path stroke="#000" d="m1 3 5.445 3.63a1 1 0 0 0 1.11 0L13 3"/>
        </svg>
        <span class="share-text">Share this song</span>
      </a>
    ` : `
      <a class="email-share-button share-button" href="${emailShareLink}" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none">
          <rect width="13" height="9" x=".5" y="2.5" stroke="#000" rx=".5"/>
          <path stroke="#000" d="m1 3 5.445 3.63a1 1 0 0 0 1.11 0L13 3"/>
        </svg>
        <span class="share-text">Share this song</span>
      </a>
    `;

    // We update the email share link right as the user clicks it to ensure that it shares
    // the latest data. Previously, we updated it on "songState*" changes, but often, this
    // ShareButton component would update before the URL did, resulting in sharing stale data.
    this.element.querySelector('.email-share-button').addEventListener('click', this.updateEmailShareLink);
    this.element.querySelector('.web-share-button')?.addEventListener('click', this.handleWebShareClick);
  }
}

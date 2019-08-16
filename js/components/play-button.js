import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class PlayButton extends Component {
  constructor() {
    super({
      renderTrigger: 'isScrolling',
      element: document.querySelector('#play-button-wrapper')
    });
  }

  getIconSvg(isScrolling) {
    const iconFill = getComputedStyle(document.documentElement).getPropertyValue('--mb-gray-60');

    if (isScrolling) {
      return `
        <svg id="pause-svg" width="100%" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
          <path fill="${iconFill}" d="M29 58C12.984 58 0 45.016 0 29S12.984 0 29 0s29 12.984 29 29-12.984 29-29 29zm-9-41a2 2 0 0 0-2 2v21a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V19a2 2 0 0 0-2-2h-5zm13 0a2 2 0 0 0-2 2v21a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V19a2 2 0 0 0-2-2h-5z" fill-rule="evenodd"/>
        </svg>
      `;
    } else {
      return `
        <svg id="play-svg"  width="100%" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
          <path fill="${iconFill}" d="M29 58C12.984 58 0 45.016 0 29S12.984 0 29 0s29 12.984 29 29-12.984 29-29 29zm12.193-27.292a2 2 0 0 0 0-3.416L24.04 16.85A2 2 0 0 0 21 18.56V39.44a2 2 0 0 0 3.04 1.709l17.153-10.442z" fill-rule="evenodd"/>
        </svg>
      ` ;
    }
  }

  // This controls dynamic aspects of Play/Pause functionality.
  render() {
    console.log('Play Button was rendered');

    const isScrolling = musicBoxStore.state.appState.isScrolling;
    const classes = isScrolling ? 'is-playing' : '';
    const buttonText = isScrolling ? 'Pause' : 'Play';

    this.element.innerHTML = `
      <button class="play-button ${classes}" aria-pressed="${isScrolling}" aria-label="${buttonText}" role="button" >
        ${this.getIconSvg(isScrolling)}
      </button>
    `;

    this.element.querySelector('.play-button').addEventListener('click', () => {
      musicBoxStore.dispatch('toggleScrolling', !musicBoxStore.state.appState.isScrolling);
    });
  }
}

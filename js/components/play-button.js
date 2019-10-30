import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class PlayButton extends Component {
  constructor() {
    super({
      renderTrigger: 'appState.isScrolling',
      element: document.querySelector('#play-button-wrapper')
    });
  }

  getIconSvg(isScrolling) {
    if (isScrolling) {
      return `
        <svg id="pause-svg" width="100%" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <circle class="play-button__outer-circle" cx="29" cy="29" r="29"/>
            <g transform="translate(18 17)" class="play-button__inner-shape">
              <rect x="13" width="9" height="25" rx="2"/>
              <rect width="9" height="25" rx="2"/>
            </g>
          </g>
        </svg>
      `;
    } else {
      return `
        <svg id="play-svg"  width="100%" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <circle class="play-button__outer-circle" cx="29" cy="29" r="29"/>
            <path class="play-button__inner-shape" d="M41.193 30.708L24.04 41.15A2 2 0 0 1 21 39.44V18.56a2 2 0 0 1 3.04-1.709l17.153 10.442a2 2 0 0 1 0 3.416z"/>
          </g>
        </svg>
      ` ;
    }
  }

  onClick() {
    musicBoxStore.setState('appState.isScrolling', !musicBoxStore.state.appState.isScrolling);
  }

  render() {
    const isScrolling = musicBoxStore.state.appState.isScrolling;
    const classes = classNames('play-button', { 'is-playing': isScrolling });
    const buttonText = isScrolling ? 'Pause (Space)' : 'Play (Space)';

    this.element.innerHTML = `
      <button class="${classes}" aria-pressed="${isScrolling}" aria-label="${buttonText}" title="${buttonText}" role="button" >
        ${this.getIconSvg(isScrolling)}
      </button>
    `;

    this.element.querySelector('.play-button').addEventListener('click', this.onClick);
  }
}

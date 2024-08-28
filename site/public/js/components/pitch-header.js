import { MBComponent } from './music-box-component.js';
import { getCurrentPitchArray } from '../common/box-types.js';
import classNames from '../vendor/classnames.js';
import { musicBoxStore } from '../music-box-store.js';

export class PitchHeader extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#pitch-header'),
      renderTrigger: ['songState.songData', 'appState.highlightedPitch']
    });
  }

  render() {
    const pitchArray = getCurrentPitchArray();
    const highlightedPitch = musicBoxStore.state.appState.highlightedPitch;

    this.element.innerHTML = `
      ${pitchArray.map(pitchId => (
      `<div class="${classNames('pitch-label', { 'is-highlighted': pitchId === highlightedPitch, 'sharp': pitchId[1] === '#' })}">
          ${pitchId[0]}
        </div>`
    )).join('')}
    `;
  }
}

import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class AudioDisabledMessage extends Component {
  constructor() {
    super({
      renderTrigger: ['isAudioDisabledMessageVisible', 'isAudioDisabledMessageResolved'],
      element: document.querySelector('#audio-disabled-message')
    });
  }

  render() {
    console.log('AudioDisabledMessage was rendered');

    this.element.className = classNames('audio-disabled-message', {
      'audio-disabled-message--hidden': !musicBoxStore.state.appState.isAudioDisabledMessageVisible,
      'audio-disabled-message--audio-enabled': musicBoxStore.state.appState.isAudioDisabledMessageResolved,
    });

    this.element.innerHTML = !musicBoxStore.state.appState.isAudioDisabledMessageResolved ?
      `<strong>Not hearing anything?</strong><br>Your browser disabled the sound. Click anywhere to enable it.`
      :
      `<strong>Perfecto!</strong><br>Your sound should be working now.`
      ;
  }
}

import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import classNames from '../vendor/classnames.js';

export class AudioDisabledMessage extends Component {
  constructor() {
    super({
      renderTrigger: 'appState.audioDisabledMessageStatus',
      element: document.querySelector('#audio-disabled-message')
    });

    this.disabledMessageText = '<strong>Not hearing anything?</strong><br>Your browser disabled the sound. Click anywhere to enable it.';
    this.enabledMessageText = '<strong>Perfecto!</strong><br>Your sound should be working now.';
    this.lastTimeoutId = 0;
  }

  render() {
    let messageBody;
    let statusClass;

    // This switch statement documents the three possible states: hidden, alerting, and resolved.
    switch(musicBoxStore.state.appState.audioDisabledMessageStatus) {
      case 'hidden':
        messageBody = this.disabledMessageText;
        statusClass = 'audio-disabled-message--hidden';
        break;
      case 'alerting':
        messageBody = this.disabledMessageText;
        statusClass = '';
        break;
      case 'resolved':
        messageBody = this.enabledMessageText;
        statusClass = 'audio-disabled-message--resolved';

        // If an existing timeout hasn't resolved, cancel it before scheduling a new one.
        // It's unlikely, but good to be safe!
        clearTimeout(this.lastTimeoutId);

        // Automatically change state to 'hidden' after 3 seconds.
        this.lastTimeoutId = setTimeout(() => {
          musicBoxStore.setState('appState.audioDisabledMessageStatus', 'hidden');
        }, 3000)
    }

    this.element.className = classNames('audio-disabled-message', statusClass);
    this.element.innerHTML = messageBody;
  }
}

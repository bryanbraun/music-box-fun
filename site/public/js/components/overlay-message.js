import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';

const DELAY_BEFORE_FADE = 2000;
const DELAY_BEFORE_REMOVE = 4000;

const VISIBILITY = {
  FULL: 'full',
  FADING: 'fading',
  NONE: 'none'
}

export class OverlayMessage extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#overlay-message'),
    });

    // This component subscribes to raw publish events instead of changes to values
    // in state.js. We do this because we want to force re-renders every time we publish
    // a new message, even if the value is identical. This allows us to reset the message
    // fade timer. The visibility and message are managed as internal state.
    musicBoxStore.subscribe('OverlayMessage', (message) => this.setState({
      visibility: VISIBILITY.FULL,
      message,
    }));

    this.fadeTimeoutId = null;
    this.removeTimeoutId = null;
  }

  render() {
    switch (this.state.visibility) {
      case VISIBILITY.FULL:
        clearTimeout(this.fadeTimeoutId);
        clearTimeout(this.removeTimeoutId);

        this.fadeTimeoutId = setTimeout(() => {
          this.setState({ visibility: VISIBILITY.FADING });
        }, DELAY_BEFORE_FADE);

        this.removeTimeoutId = setTimeout(() => {
          this.setState({ visibility: VISIBILITY.NONE });
        }, DELAY_BEFORE_REMOVE);

        this.element.innerHTML = `<div class="overlay-message__content">${this.state.message}</div>`;
        break;
      case VISIBILITY.FADING:
        this.element.firstChild.classList.add('is-fading');
        break;
      case VISIBILITY.NONE:
        this.element.innerHTML = '';
        break;
    }
  }
}

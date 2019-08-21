import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';
import { playheadObserver } from '../playhead-observer.js';

export class Note extends Component {
  constructor(props) {
    super({
      props,
      element: document.querySelector(`#${props.id}`)
    });
  }

  removeNote(event) {
    const pitch = event.target.parentElement.id;
    const yposRegex = /translateY\((\d+)px\)/;
    const yposMatch = event.target.style.transform.match(yposRegex);
    const ypos = (yposMatch && yposMatch[1]) ? parseInt(yposMatch[1]) : console.error('Could not find note position');

    musicBoxStore.dispatch('removeNote', { pitch, ypos });
  }

  render() {
    this.element.addEventListener('click', this.removeNote);
    playheadObserver.observe(this.element);
  }
}

import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';

export class ShadowNote extends Component {
  constructor(props) {
    super({
      element: document.querySelector(`#${props.shadowNoteId}`)
    });
  }

  addNote(event) {
    const pitch = event.target.parentElement.id;
    const yposRegex = /translateY\((\d+)px\)/;
    const yposMatch = event.target.style.transform.match(yposRegex);
    const ypos = (yposMatch && yposMatch[1]) ? parseInt(yposMatch[1]) : console.error('Could not find note position');

    const newPitchArray =
      [...musicBoxStore.state.songState.songData[pitch]]
        .concat(ypos)
        .sort((a, b) => Number(a) - Number(b));

    musicBoxStore.setState(`songState.songData.${pitch}`, newPitchArray);
  }

  render() {
    this.element.addEventListener('click', this.addNote);
  }
}

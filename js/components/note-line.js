import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';
import { playheadObserver } from '../playhead-observer.js';
import {
  showShadowNote,
  hideShadowNote,
  haveShadowNoteFollowCursor,
  punchHole,
  removeHole,
} from './note-line-events.js';

export class NoteLine extends Component {
  constructor(props) {
    super({
      props,
      renderTrigger: props.id,
      element: document.querySelector(`#${props.id}`)
    });
  }

  render() {
    console.log(`Noteline ${this.props.id} was rendered`);
    const notesArray = musicBoxStore.state.songState.songData[this.props.id]
      .split(',')
      .filter(val => val.length !== 0);

    // Prevent weird bugs by removing observers from any existing notes, before re-rendering.
    this.element.querySelectorAll('.hole').forEach(hole => playheadObserver.unobserve(hole));

    this.element.innerHTML = `
      <div class="shadow-note"></div>
      ${notesArray
        .map(note => `<div class="hole" style="transform: translateY(${note}px)"></div>`)
        .join('')}
    `;

    this.element.addEventListener('mouseenter', showShadowNote);
    this.element.addEventListener('mouseleave', hideShadowNote);
    this.element.addEventListener('mousemove', haveShadowNoteFollowCursor);
    this.element.querySelector('.shadow-note').addEventListener('click', punchHole);
    this.element.querySelectorAll('.hole').forEach(hole => {
      hole.addEventListener('click', removeHole);
      playheadObserver.observe(hole);
    });
  }
}

import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';
import { playheadObserver } from '../playhead-observer.js';
import { ShadowNote } from './shadow-note.js';
import { Note } from './note.js';

export class NoteLine extends Component {
  constructor(props) {
    super({
      props,
      renderTrigger: `songState.songData.${props.id}`,
      element: document.querySelector(`#${props.id}`)
    });

    this.showShadowNote = this.showShadowNote.bind(this);
    this.hideShadowNote = this.hideShadowNote.bind(this);
    this.haveShadowNoteFollowCursor = this.haveShadowNoteFollowCursor.bind(this);
  }

  showShadowNote(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    this.positionShadowNote(shadowNoteEl, event.pageY);
    shadowNoteEl.classList.add('shadow-note--visible');
  }

  hideShadowNote(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    shadowNoteEl.style = `transform: translateY(0px)`;
    shadowNoteEl.classList.remove('shadow-note--visible');
  }

  haveShadowNoteFollowCursor(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    this.positionShadowNote(shadowNoteEl, event.pageY);
  }

  positionShadowNote(shadowNoteEl, cursorPositionPageY) {
    const relativeYPos = cursorPositionPageY - shadowNoteEl.parentElement.offsetTop;
    const holeRadius = shadowNoteEl.clientHeight / 2;

    // Prevent users from positioning notes too high on the note line.
    if (relativeYPos < holeRadius) {
      return false;
    }

    shadowNoteEl.style = `transform: translateY(${relativeYPos - holeRadius}px)`;
  }

  render() {
    const shadowNoteId = `${this.props.id}-shadow`;
    const notesArray = musicBoxStore.state.songState.songData[this.props.id];

    // Prevent weird bugs by removing observers from any existing notes, before re-rendering.
    this.element.querySelectorAll('.hole').forEach(hole => playheadObserver.unobserve(hole));

    this.element.innerHTML = `
      <div id="${shadowNoteId}" class="shadow-note"></div>
      ${notesArray
        .map(val => `<div id="${this.props.id}-${val}" class="hole" style="transform: translateY(${val}px)"></div>`)
        .join('')}
    `;

    new ShadowNote({ shadowNoteId }).render();
    notesArray.forEach(val => new Note({ id: `${this.props.id}-${val}` }).render());

    this.element.addEventListener('mouseenter', this.showShadowNote);
    this.element.addEventListener('mouseleave', this.hideShadowNote);
    this.element.addEventListener('mousemove', this.haveShadowNoteFollowCursor);
  }
}

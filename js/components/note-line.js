import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';
import { playheadObserver } from '../playhead-observer.js';
import { ShadowNote } from './shadow-note.js';
import { Note } from './note.js';

export class NoteLine extends Component {
  constructor(props) {
    super({
      props,
      renderTrigger: props.id,
      element: document.querySelector(`#${props.id}`)
    });

    this.holeWidth = null; // For caching this value
    this.showShadowNote = this.showShadowNote.bind(this);
    this.hideShadowNote = this.hideShadowNote.bind(this);
    this.haveShadowNoteFollowCursor = this.haveShadowNoteFollowCursor.bind(this);
  }

  showShadowNote(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    // We cache this value once on showShadowNote to prevent repetitive lookups on hover.
    this.holeWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--hole-width').trim()
    );

    this.positionShadowNote(shadowNoteEl, event.layerY);
    shadowNoteEl.classList.add('shadow-note--visible');
  }

  hideShadowNote(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');
    shadowNoteEl.style = `transform: translateY(0px)`;
    shadowNoteEl.classList.remove('shadow-note--visible');
  }

  haveShadowNoteFollowCursor(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');
    this.positionShadowNote(shadowNoteEl, event.layerY);
  }

  positionShadowNote(shadowNoteEl, yPosition) {
    // Prevent users from positioning notes too high on the note line.
    if (yPosition < (this.holeWidth / 2)) {
      return false;
    }

    // Note: layerY is supported across browsers, but it's technically
    // not a standard, so this code may fail at some point in the future.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/layerY
    shadowNoteEl.style = `transform: translateY(${yPosition - (this.holeWidth / 2)}px)`;
  }

  render() {
    const shadowNoteId = `${this.props.id}-shadow`;
    const notesArray = musicBoxStore.state.songState.songData[this.props.id]
      .split(',')
      .filter(val => val.length !== 0);

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

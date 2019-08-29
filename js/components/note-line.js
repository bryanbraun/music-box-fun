import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';
import { playheadObserver } from '../playhead-observer.js';

export class NoteLine extends Component {
  constructor(props) {
    super({
      props,
      renderTrigger: `songState.songData.${props.id}`,
      element: document.querySelector(`#${props.id}`)
    });

    // We need to bind these in order to use "this" inside of them.
    this.showShadowNote = this.showShadowNote.bind(this);
    this.haveShadowNoteFollowCursor = this.haveShadowNoteFollowCursor.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.holeWidth = null; // For caching this value
  }

  showShadowNote(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    // We cache this value once on showShadowNote to prevent repetitive lookups on hover.
    this.holeWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--hole-width').trim()
    );

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
    const relativeCursorYPos = cursorPositionPageY - shadowNoteEl.parentElement.offsetTop;
    const holeRadius = this.holeWidth / 2;
    const snapToGrid = true;
    let noteYPosition;

    // Prevent users from positioning notes too high on the note line.
    if (relativeCursorYPos < holeRadius) {
      return false;
    }

    if (snapToGrid) {
      const topPixelOffset = this.holeWidth;
      const distanceBetweenBars = 25;

      const snapToNearestBar = val => (
        Math.round((val + topPixelOffset) / distanceBetweenBars) * distanceBetweenBars - topPixelOffset
      );

      noteYPosition = snapToNearestBar(relativeCursorYPos - holeRadius);
    } else {
      noteYPosition = relativeCursorYPos - holeRadius;
    }

    shadowNoteEl.style = `transform: translateY(${noteYPosition}px)`;
  }

  handleClick(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');
    const pitch = event.currentTarget.id;
    const getNoteYPos = element => {
      const yposMatch = element.style.transform.match(/translateY\((\d+)px\)/);
      return (yposMatch && yposMatch[1]) ? parseInt(yposMatch[1]) : console.error("Couldn't find note position");
    };

    if (event.target.className === 'hole') {
      this.removeNote(pitch, getNoteYPos(event.target));
    } else {
      this.addNote(pitch, getNoteYPos(shadowNoteEl))
    }
  }

  addNote(pitch, ypos) {
    const newPitchArray =
      [...musicBoxStore.state.songState.songData[pitch]]
        .concat(ypos)
        .sort((a, b) => Number(a) - Number(b));

    musicBoxStore.setState(`songState.songData.${pitch}`, newPitchArray);
  }

  removeNote(pitch, ypos) {
    const newPitchArray =
      [...musicBoxStore.state.songState.songData[pitch]]
        .filter(val => val !== ypos);

    musicBoxStore.setState(`songState.songData.${pitch}`, newPitchArray);
  }

  render() {
    const notesArray = musicBoxStore.state.songState.songData[this.props.id];

    // Prevent weird bugs by removing observers from any existing notes, before re-rendering.
    this.element.querySelectorAll('.hole').forEach(hole => playheadObserver.unobserve(hole));

    this.element.innerHTML = `
      <div class="shadow-note"></div>
      ${notesArray
        .map(val => `<div id="${this.props.id}-${val}" class="hole" style="transform: translateY(${val}px)"></div>`)
        .join('')}
    `;

    this.element.querySelectorAll('.hole').forEach(hole => playheadObserver.observe(hole));
    this.element.addEventListener('mouseenter', this.showShadowNote);
    this.element.addEventListener('mouseleave', this.hideShadowNote);
    this.element.addEventListener('mousemove', this.haveShadowNoteFollowCursor);
    this.element.addEventListener('click', this.handleClick);
  }
}

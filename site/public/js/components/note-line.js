import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import { playheadObserver } from '../common/playhead-observer.js';
import { sampler } from '../common/sampler.js';
import { forEachNotes } from '../common/silent-notes.js';
import { QUARTER_BAR_GAP, EIGHTH_BAR_GAP, SIXTEENTH_BAR_GAP, STANDARD_HOLE_RADIUS } from '../common/constants.js';

export class NoteLine extends Component {
  constructor(props) {
    super({
      props,
      renderTrigger: `songState.songData.${props.id}`,
      element: document.getElementById(props.id)
    });

    // We need to bind these in order to use "this" inside of them.
    this.showShadowNote = this.showShadowNote.bind(this);
    this.haveShadowNoteFollowCursor = this.haveShadowNoteFollowCursor.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.adjustStoredYPosForHoleSize = this.adjustStoredYPosForHoleSize.bind(this);
    this.adjustDisplayedYPosForHoleSize = this.adjustDisplayedYPosForHoleSize.bind(this);

    // Cached Constants
    this.holeWidth = null;
    this.holeRadius = null;

    // When a note is added or removed, the NoteLine is re-rendered underneath the cursor.
    // In this situation, the mouse events won't fire until you move the mouse again. This
    // led to some edge-cases where the shadow note wasn't being positioned properly during
    // repeated clicks. To fix this, we store the last shadow note position (and visibility)
    // details, so we can use them to set the initial shadow note position during re-renders.
    this.lastShadowNotePosition = 0;
    this.lastShadowNoteVisibilityClass = '';
  }

  // We base a lot of our math on the size of the hole, which is a CSS variable. This value
  // could change in the future to allow us to adjust the size of the paper. When this happens,
  // we want our math to continue working. Instead of looking up the CSS variable incessantly,
  // (like on hover) we use this function to look it up at key moments and cache the value in
  // the class instance. This simplifies our code and may improve performance.
  updateHoleSize() {
    this.holeWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hole-width').trim());
    this.holeRadius = this.holeWidth / 2;
  }

  // The yPos value we store in songData is the center of the hole (the moment when the note plays).
  // This is ideal for ToneJS, and it makes sense for a UI with a variety of hole sizes. But in
  // order to position these holes with translateY, we need to reference the top of each hole. These
  // functions allow us to adjust the yPos for display vs storage, so it is always stored using the
  // center value, but displayed using the top value.
  adjustDisplayedYPosForHoleSize(yPos) {
    const holeSizeDifferenceBeforeTheFirstBar = 2 * (STANDARD_HOLE_RADIUS - this.holeRadius);
    return yPos - this.holeRadius - holeSizeDifferenceBeforeTheFirstBar;
  }
  adjustStoredYPosForHoleSize(yPos) {
    const holeSizeDifferenceBeforeTheFirstBar = 2 * (STANDARD_HOLE_RADIUS - this.holeRadius);
    return yPos + this.holeRadius + holeSizeDifferenceBeforeTheFirstBar;
  }

  showShadowNote(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    this.updateHoleSize();

    this.lastShadowNoteVisibilityClass = 'shadow-note--visible';
    shadowNoteEl.classList.add('shadow-note--visible');
  }

  hideShadowNote(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    this.lastShadowNotePosition = 0;
    this.lastShadowNoteVisibilityClass = '';
    shadowNoteEl.style = `transform: translateY(0px)`;
    shadowNoteEl.classList.remove('shadow-note--visible');
  }

  haveShadowNoteFollowCursor(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    this.positionShadowNote(shadowNoteEl, event.pageY);
  }

  snapToInterval(noteYPosition, INTERVAL) {
    if (!INTERVAL) return noteYPosition;

    const topPixelOffset = this.holeRadius;
    // I arrived at this formula through trial-and-error with Josiah, and it works!
    return Math.round((noteYPosition - topPixelOffset) / INTERVAL) * INTERVAL + topPixelOffset;
  }

  positionShadowNote(shadowNoteEl, cursorPositionPageY) {
    // We're building the translateY value for the shadow note, but the web apis aren't ideal so we have to cobble it
    // together from the properties we have. For noteLinesPageOffsetTop, see https://stackoverflow.com/q/34422189/1154642
    const noteLinesPageOffsetTop = document.querySelector('#note-lines').getBoundingClientRect().top + window.scrollY;
    const relativeCursorYPos = cursorPositionPageY - noteLinesPageOffsetTop;

    // Prevent users from positioning notes too high on the note line.
    if (relativeCursorYPos < this.holeRadius) {
      return false;
    }

    const snapToIntervals = {
      'none': 0,
      'grid': EIGHTH_BAR_GAP,
      '16ths': SIXTEENTH_BAR_GAP,
      '¼ triplet': (2 * QUARTER_BAR_GAP) / 3,
      '⅛ triplet': (2 * EIGHTH_BAR_GAP) / 3,
    };

    const currentSelectedInterval = snapToIntervals[musicBoxStore.state.appState.snapTo];
    const noteYPositionAdjustedForCentering = relativeCursorYPos - this.holeRadius;
    const shadowNoteYPosition = this.snapToInterval(noteYPositionAdjustedForCentering, currentSelectedInterval);

    this.lastShadowNotePosition = shadowNoteYPosition;
    shadowNoteEl.style = `transform: translateY(${shadowNoteYPosition}px)`;
  }

  handleClick(event) {
    const noteLineEl = event.currentTarget;
    const shadowNoteEl = noteLineEl.querySelector('.shadow-note');
    const pitch = noteLineEl.id;

    const isShadowNoteOverlappingExistingNote = shadowNoteYPos => (
      musicBoxStore.state.songState.songData[pitch].includes(
        this.adjustStoredYPosForHoleSize(shadowNoteYPos)
      )
    );

    const getNoteYPos = element => {
      const yposMatch = element.style.transform.match(/translateY\((\d+\.?\d*)px\)/); // https://regex101.com/r/49U5Dx/1
      return (yposMatch && yposMatch[1]) ? parseInt(yposMatch[1]) : console.error("Couldn't find note position");
    };

    const shadowNoteYPos = getNoteYPos(shadowNoteEl);

    if (event.target.classList.contains('hole')) {
      this.removeNote(pitch, getNoteYPos(event.target));
    }
    else if (isShadowNoteOverlappingExistingNote(shadowNoteYPos)) {
      // This case happens when snap-to-grid allows you to click when your
      // cursor isn't on an existing note but your shadow note is.
      this.removeNote(pitch, shadowNoteYPos);
    }
    else {
      this.addNote(pitch, shadowNoteYPos)
    }
  }

  addNote(pitch, yPos) {
    const storedYPos = this.adjustStoredYPosForHoleSize(yPos);
    const newPitchArray =
      [...musicBoxStore.state.songState.songData[pitch]]
        .concat(storedYPos)
        .sort((a, b) => Number(a) - Number(b));

    sampler.triggerAttackRelease(pitch, '8n');
    musicBoxStore.setState(`songState.songData.${pitch}`, newPitchArray);
  }

  removeNote(pitch, yPos) {
    const storedYPos = this.adjustStoredYPosForHoleSize(yPos);
    const newPitchArray =
      [...musicBoxStore.state.songState.songData[pitch]]
        .filter(val => val !== storedYPos);

    musicBoxStore.setState(`songState.songData.${pitch}`, newPitchArray);
  }

  renderNotes(pitch) {
    const notesArray = musicBoxStore.state.songState.songData[pitch];
    let notesMarkup = '';

    forEachNotes(notesArray, (yPos, isSilent) => {
      const displayedYPos = this.adjustDisplayedYPosForHoleSize(yPos);
      notesMarkup += `<button class="hole ${isSilent ? 'silent' : ''}" style="transform: translateY(${displayedYPos}px)"></button>`;
    })

    return notesMarkup;
  }

  render() {
    this.updateHoleSize();

    // Prevent weird bugs by removing observers from any existing notes, before re-rendering.
    this.element.querySelectorAll('.hole').forEach(hole => playheadObserver.get().unobserve(hole));

    this.element.innerHTML = `
      <div class="shadow-note ${this.lastShadowNoteVisibilityClass}" style="transform: translateY(${this.lastShadowNotePosition}px)"></div>
      ${this.renderNotes(this.props.id)}
    `;

    this.element.querySelectorAll('.hole').forEach(hole => playheadObserver.get().observe(hole));
    this.element.addEventListener('mouseenter', this.showShadowNote);
    this.element.addEventListener('mouseleave', this.hideShadowNote);
    this.element.addEventListener('mousemove', this.haveShadowNoteFollowCursor);
    this.element.addEventListener('click', this.handleClick);
  }
}

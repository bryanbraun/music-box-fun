import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';
import { playheadObserver } from '../services/playhead-observer.js';
import { sampler } from '../services/sampler.js';

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

    // Constants
    this.QUARTER_BAR_GAP = 50; // Pixel distance between the black quarter note bars.
    this.EIGHTH_BAR_GAP = 25; // Pixel distance between the gray eighth note bars.

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
  // we use this function to look it up at key moments and cache the value in the class instance.
  // This simplifies our code and may improve performance. If we end up never adjusting the hole
  // size, we can remove this function and store the sizes as hard-coded constants in the class.
  updateHoleSize() {
    this.holeWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hole-width').trim());
    this.holeRadius = this.holeWidth / 2;
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

  positionShadowNote(shadowNoteEl, cursorPositionPageY) {
    const relativeCursorYPos = cursorPositionPageY - shadowNoteEl.parentElement.offsetTop;
    let noteYPosition;

    // Prevent users from positioning notes too high on the note line.
    if (relativeCursorYPos < this.holeRadius) {
      return false;
    }

    if (musicBoxStore.state.appState.isSnappingToGrid) {
      const topPixelOffset = this.holeWidth;

      const snapToNearestBar = val => (
        Math.round((val + topPixelOffset) / this.EIGHTH_BAR_GAP) * this.EIGHTH_BAR_GAP - topPixelOffset
      );

      noteYPosition = snapToNearestBar(relativeCursorYPos - this.holeRadius);
    } else {
      noteYPosition = relativeCursorYPos - this.holeRadius;
    }

    this.lastShadowNotePosition = noteYPosition;
    shadowNoteEl.style = `transform: translateY(${noteYPosition}px)`;
  }

  handleClick(event) {
    const noteLineEl = event.currentTarget;
    const shadowNoteEl = noteLineEl.querySelector('.shadow-note');
    const pitch = noteLineEl.id;

    const isShadowNoteOverlappingExistingNote = shadowNoteYPos => (
      musicBoxStore.state.songState.songData[pitch].includes(shadowNoteYPos)
    );

    const getNoteYPos = element => {
      const yposMatch = element.style.transform.match(/translateY\((\d+)px\)/);
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

  addNote(pitch, ypos) {
    const newPitchArray =
      [...musicBoxStore.state.songState.songData[pitch]]
        .concat(ypos)
        .sort((a, b) => Number(a) - Number(b));

    sampler.triggerAttackRelease(pitch, '8n');
    musicBoxStore.setState(`songState.songData.${pitch}`, newPitchArray);
  }

  removeNote(pitch, ypos) {
    const newPitchArray =
      [...musicBoxStore.state.songState.songData[pitch]]
        .filter(val => val !== ypos);

    musicBoxStore.setState(`songState.songData.${pitch}`, newPitchArray);
  }

  renderNotes(pitch) {
    const notesArray = musicBoxStore.state.songState.songData[pitch];
    const deadZoneLength = this.QUARTER_BAR_GAP - this.holeRadius - 1;
    let lastPlayableNoteYPos = 0;
    let notesMarkup = '';

    notesArray.forEach((yPos, i) => {
      const isNotePlayable = (i === 0) ? true : (yPos - lastPlayableNoteYPos > deadZoneLength);
      lastPlayableNoteYPos = isNotePlayable ? yPos : lastPlayableNoteYPos; // update this scoped variable.

      notesMarkup += `<button class="hole ${isNotePlayable ? '' : 'silent'}" style="transform: translateY(${yPos}px)"></button>`;
    });

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

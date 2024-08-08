import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { throttle } from '../utils/throttle.js';
import { getCurrentPitchArray } from '../common/box-types.js';
import { PAPER_SIDE_MARGIN } from '../common/constants.js';

function getRelativeXPos(mouseEvent) {
  const offsetParentElPageLeft = mouseEvent.currentTarget.offsetParent.getBoundingClientRect().left;
  return mouseEvent.pageX - offsetParentElPageLeft;
}

export class Selection extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#selection')
    });

    // drag positions relative to the offsetParent (the CSS "position: relative" parent)
    this.dragStartXPos = null;
    this.dragStartYPos = null;

    // cached to prevent repetitive DOM queries
    this.selectionZoneEl = null;
    this.selectionBoxEl = null;

    // Throttle the dragging event to reduce re-renders (while snapping is set to none).
    // We could throttle mousemove, but there's little benefit (mousemove alone has very
    // little processing) and it makes hovering feel a bit less smooth.
    this.handleDragging = throttle(this.handleDragging.bind(this), 25);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  handleDragging(event) {
    // Resize drag zone
    this.selectionZoneEl.classList.add('is-dragging');

    // Draw selection box
    const relativeYPos = event.offsetY;
    const relativeXPos = getRelativeXPos(event);
    const isYInverted = relativeYPos < this.dragStartYPos;
    const isXInverted = relativeXPos < this.dragStartXPos;
    this.selectionBoxEl.style = `
      top: ${isYInverted ? relativeYPos : this.dragStartYPos}px;
      left: ${isXInverted ? relativeXPos : this.dragStartXPos}px;
      width: ${Math.abs(relativeXPos - this.dragStartXPos)}px;
      height: ${Math.abs(relativeYPos - this.dragStartYPos)}px;
      opacity: 0.65;
    `;

    // Determine if notes are selected
    // @TODO: this currently assumes that the selection box is NOT inverted.
    //        Next step: add support for invertedY (since that's easy to test).
    const yMin = this.dragStartYPos;
    const yMax = relativeYPos;
    const xMin = this.dragStartXPos - PAPER_SIDE_MARGIN;
    const xMax = relativeXPos - PAPER_SIDE_MARGIN;

    const holeWidth = parseInt(getComputedStyle(document.body).getPropertyValue('--hole-width').trim());

    console.log({ xMin, xMax, CNoteXPos: holeWidth / 2, ENoteXPos: (holeWidth / 2) + 2 * holeWidth });

    const isNoteSelected = (noteLineIndex, noteYPos) => {
      const noteXPos = (holeWidth / 2) + (noteLineIndex * holeWidth);
      return noteYPos >= yMin && noteYPos <= yMax && noteXPos >= xMin && noteXPos <= xMax;
    }

    const selectedNotes = {};

    const pitchArray = getCurrentPitchArray();
    pitchArray.forEach((pitchId, noteLineIndex) => {
      const notesArray = musicBoxStore.state.songState.songData[pitchId];
      selectedNotes[pitchId] = notesArray.filter((noteYPos) => {
        return isNoteSelected(noteLineIndex, noteYPos);
      });
    });

    console.log(selectedNotes);

    // TODO: set selected notes to appState.

  }

  handleMouseMove(event) {
    if (this.isDragging()) {
      this.handleDragging(event);
    }
  }

  handleMouseDown(event) {
    if (musicBoxStore.state.appState.isPlaying) {
      musicBoxStore.setState('appState.isPlaying', false);
    }

    this.dragStartYPos = event.offsetY;
    this.dragStartXPos = getRelativeXPos(event);
    this.handleDragging(event);
  }

  handleMouseUp() {
    if (this.isDragging()) {
      this.resetDragging();
    }
  }

  // For dragging out of bounds.
  handleMouseOut() {
    if (this.isDragging()) {
      this.resetDragging();
    }
  }

  isDragging() {
    return this.dragStartYPos !== null && this.dragStartXPos !== null;
  }

  resetDragging() {
    this.dragStartXPos = null;
    this.dragStartYPos = null;
    this.selectionBoxEl.style = '';
    this.selectionZoneEl.classList.remove('is-dragging');
  }

  render() {
    this.element.innerHTML = `
      <div class="selection-drag-zone" title="Select notes"></div>
      <div class="selection-box"></div>
    `;

    this.selectionZoneEl = this.element.querySelector('.selection-drag-zone');
    this.selectionBoxEl = this.element.querySelector('.selection-box');

    this.selectionZoneEl.addEventListener('mousemove', this.handleMouseMove);
    this.selectionZoneEl.addEventListener('mousedown', this.handleMouseDown);
    this.selectionZoneEl.addEventListener('mouseup', this.handleMouseUp);
    this.selectionZoneEl.addEventListener('mouseout', this.handleMouseOut);
  }
}

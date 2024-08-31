import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { throttle } from '../utils/throttle.js';
import { cloneDeep } from '../utils/clone.js';
import { getCurrentPitchArray } from '../common/box-types.js';
import { onClickOutside } from '../common/on-click-outside.js';

export class Selection extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#equipment')
    });

    // drag positions relative to the offsetParent (the CSS "position: relative" parent)
    this.dragStartXPos = null;
    this.dragStartYPos = null;

    // cached to prevent repetitive DOM queries
    this.selectionZoneEl = null;
    this.selectionBoxEl = null;
    this.noteLinesEl = document.querySelector('#note-lines');

    // Throttle the dragging event to reduce re-renders (while snapping is set to none).
    // We could throttle mousemove, but there's little benefit (mousemove alone has very
    // little processing) and it makes hovering feel a bit less smooth.
    this.handleDragging = throttle(this.handleDragging.bind(this), 25);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

    onClickOutside('#equipment', this.deselectAllNotes);
  }

  handleDragging(event) {
    // Resize drag zone
    this.selectionZoneEl.classList.add('is-dragging');

    const isYInverted = event.pageY < this.dragStartYPos;
    const isXInverted = event.pageX < this.dragStartXPos;

    // Draw selection box in CSS
    this.selectionBoxEl.style = `
      top: ${isYInverted ? event.pageY : this.dragStartYPos}px;
      left: ${isXInverted ? event.pageX : this.dragStartXPos}px;
      width: ${Math.abs(event.pageX - this.dragStartXPos)}px;
      height: ${Math.abs(event.pageY - this.dragStartYPos)}px;
      opacity: 1;
    `;

    // Find selection box bounds (using note-line positions)
    const { x: noteLinesX, y: noteLinesY } = this.noteLinesEl.getBoundingClientRect();

    let yMin = this.dragStartYPos - noteLinesY;
    let yMax = event.pageY - noteLinesY;
    let xMin = this.dragStartXPos - noteLinesX;
    let xMax = event.pageX - noteLinesX;

    if (isYInverted) {
      [yMin, yMax] = [yMax, yMin];
    }
    if (isXInverted) {
      [xMin, xMax] = [xMax, xMin];
    }

    // Identify all notes within the selection box
    const selectedNotes = {};
    const holeWidth = parseInt(getComputedStyle(document.body).getPropertyValue('--hole-width').trim());
    const pitchArray = getCurrentPitchArray();

    pitchArray.forEach((pitchId, noteLineIndex) => {
      const notesArray = musicBoxStore.state.songState.songData[pitchId];

      selectedNotes[pitchId] = notesArray.filter((noteYPos) => {
        const noteXPos = (holeWidth / 2) + (noteLineIndex * holeWidth);
        const isNoteInSelectionBox = noteYPos >= yMin && noteYPos <= yMax && noteXPos >= xMin && noteXPos <= xMax;
        return isNoteInSelectionBox;
      });
    });

    musicBoxStore.setState('appState.selectedNotes', selectedNotes);
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

    // @TODO NEXT: fix the bug where pageY isn't correct when the page is scrolled
    this.dragStartYPos = event.pageY;
    this.dragStartXPos = event.pageX;

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

  deselectAllNotes() {
    console.log('deselecting all notes');
    let newSelectedNotes = cloneDeep(musicBoxStore.state.appState.selectedNotes);

    Object.keys(newSelectedNotes).forEach(pitch => {
      newSelectedNotes[pitch] = [];
    });

    musicBoxStore.setState('appState.selectedNotes', newSelectedNotes);
  }

  render() {
    // note: we insertAdjacentHTML because it means we don't need to render all the
    // dynamic child components here (which may simplify initialization). This only
    // works because this component never re-renders.
    this.element.insertAdjacentHTML('afterbegin', `
      <div class="selection">
        <div class="selection-drag-zone" title="Select notes"></div>
        <div class="selection-box"></div>
      </div>
    `);

    this.selectionZoneEl = this.element.querySelector('.selection-drag-zone');
    this.selectionBoxEl = this.element.querySelector('.selection-box');

    this.selectionZoneEl.addEventListener('mousemove', this.handleMouseMove);
    this.selectionZoneEl.addEventListener('mousedown', this.handleMouseDown);
    this.selectionZoneEl.addEventListener('mouseup', this.handleMouseUp);
    this.selectionZoneEl.addEventListener('mouseout', this.handleMouseOut);

    this.element.addEventListener('mousedown', (event) => {
      if (event.currentTarget !== event.target) return;

      this.handleMouseDown(event);
    });
  }
}

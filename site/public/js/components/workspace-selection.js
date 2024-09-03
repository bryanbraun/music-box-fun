import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { throttle } from '../utils/throttle.js';
import { getCurrentPitchArray } from '../common/box-types.js';
import { hasSelectedNotes, dedupeAndSortSongData, clearAllExistingNotes } from '../common/notes.js';

export class WorkspaceSelection extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#workspace')
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

    // We'd use addDocumentClickListener for this, except we need it to run on mousedown,
    // on the capturing phase, in order to intervene before a new selection is started.
    document.addEventListener('mousedown', this.handleNoteDeselection, { capture: true });
  }

  handleDragging(event) {
    // Resize drag zone
    this.selectionZoneEl.classList.add('is-dragging');

    const isYInverted = event.clientY < this.dragStartYPos;
    const isXInverted = event.clientX < this.dragStartXPos;

    // Draw selection box in CSS
    this.selectionBoxEl.style = `
      top: ${isYInverted ? event.clientY : this.dragStartYPos}px;
      left: ${isXInverted ? event.clientX : this.dragStartXPos}px;
      width: ${Math.abs(event.clientX - this.dragStartXPos)}px;
      height: ${Math.abs(event.clientY - this.dragStartYPos)}px;
      opacity: 1;
    `;

    // Find selection box bounds, with coordinates relative to note-line positions
    const { x: noteLinesX, y: noteLinesY } = this.noteLinesEl.getBoundingClientRect();

    let yMin = this.dragStartYPos - noteLinesY;
    let yMax = event.clientY - noteLinesY;
    let xMin = this.dragStartXPos - noteLinesX;
    let xMax = event.clientX - noteLinesX;

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
    if (musicBoxStore.state.appState.isTextSelectionEnabled) {
      musicBoxStore.setState('appState.isTextSelectionEnabled', false);
    }
    if (musicBoxStore.state.appState.isPlaying) {
      musicBoxStore.setState('appState.isPlaying', false);
    }

    this.dragStartYPos = event.clientY;
    this.dragStartXPos = event.clientX;

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

    if (!musicBoxStore.state.appState.isTextSelectionEnabled) {
      musicBoxStore.setState('appState.isTextSelectionEnabled', true);
    }
  }

  handleNoteDeselection(event) {
    if (!hasSelectedNotes()) return;

    // During deselect, we remove duplicate notes (which can occur when nudging or
    // dragging selected notes). It should only rerender a note-line if it was modified.
    const dedupedSongData = dedupeAndSortSongData(musicBoxStore.state.songState.songData);
    Object.entries(dedupedSongData).forEach(([pitchId, dedupedNotesArray]) => {
      musicBoxStore.setState(`songState.songData[${pitchId}]`, dedupedNotesArray);
    });

    const clearedSelectedNotes = clearAllExistingNotes(musicBoxStore.state.appState.selectedNotes);
    musicBoxStore.setState('appState.selectedNotes', clearedSelectedNotes);
  }

  render() {
    // note: we insertAdjacentHTML because it means we don't need to render all the
    // dynamic child components here (which may simplify initialization). This only
    // works because this component never re-renders.
    this.element.insertAdjacentHTML('afterbegin', `
      <div class="selection">
        <div class="selection-drag-zone"></div>
        <div class="selection-box"></div>
      </div>
    `);

    this.selectionZoneEl = this.element.querySelector('.selection-drag-zone');
    this.selectionBoxEl = this.element.querySelector('.selection-box');

    this.selectionZoneEl.addEventListener('mousemove', this.handleMouseMove);
    this.selectionZoneEl.addEventListener('mouseup', this.handleMouseUp);
    this.selectionZoneEl.addEventListener('mouseout', this.handleMouseOut);

    this.element.addEventListener('mousedown', (event) => {
      if (event.currentTarget !== event.target) return;

      this.handleMouseDown(event);
    });
  }
}

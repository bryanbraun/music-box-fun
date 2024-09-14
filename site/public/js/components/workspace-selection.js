import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { throttle } from '../utils/throttle.js';
import { cloneDeep } from '../utils/clone.js';
import { getCurrentPitchArray } from '../common/box-types.js';
import { hasSelectedNotes, dedupeAndSortSongData, clearAllExistingNotes } from '../common/notes.js';

export class WorkspaceSelection extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#workspace')
    });

    this.dragStartXPos = null;
    this.dragStartYPos = null;
    this.previouslySelectedNotes = null;

    // cached to prevent repetitive DOM queries
    this.selectionZoneEl = null;
    this.selectionBoxEl = null;
    this.noteLinesEl = document.querySelector('#note-lines');

    // Throttle the dragging event to reduce re-renders (while snapping is set to none).
    // We could throttle mousemove, but there's little benefit (mousemove alone has very
    // little processing) and it makes hovering feel a bit less smooth.
    this.handleDragging = throttle(this.handleDragging.bind(this), 25);

    this.handleWorkspaceMouseDown = this.handleWorkspaceMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleNoteDeselection = this.handleNoteDeselection.bind(this);

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

    // Add any notes within the selection box to selectedNotes.
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

    // Merge all multi-select notes into selectedNotes.
    if (this.multiSelectNotes) {
      Object.entries(this.multiSelectNotes).forEach(([pitchId, multiSelectNotesArray]) => {
        selectedNotes[pitchId] = [...selectedNotes[pitchId] || [], ...multiSelectNotesArray].sort((a, b) => a - b);
      });
    }

    musicBoxStore.setState('appState.selectedNotes', selectedNotes);
  }

  handleWorkspaceMouseDown(event) {
    // Ignore clicks on #workspace children (like the paper).
    if (event.currentTarget !== event.target) return;

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

  handleMouseMove(event) {
    if (this.isDragging()) {
      this.handleDragging(event);
    }
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

    // Don't deselect if the user is trying to drag notes.
    if (event.target.matches('.hole.is-selected')) return;

    // If the user is holding shift, they are trying to use multi-select. Here, we save all
    // previously selected notes as "multi-select notes," so we know to keep them selected.
    if (event.shiftKey) {
      this.multiSelectNotes = cloneDeep(musicBoxStore.state.appState.selectedNotes);
      return; // We don't deselect anything when the user is trying to multi-select.
    } else {
      this.multiSelectNotes = null;
    }

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

    this.element.addEventListener('mousedown', this.handleWorkspaceMouseDown);
  }
}

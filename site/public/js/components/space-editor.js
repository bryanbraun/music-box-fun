import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { getFinalNoteYPos, dedupeAndSortSongData } from '../common/notes.js';
import { snapToInterval } from "../common/snap-to-interval.js";
import { resizePaperIfNeeded } from '../common/pages.js';
import { throttle } from '../utils/throttle.js';
import { debounce } from '../utils/debounce.js';
import { WAIT_FOR_STATE } from '../constants.js';

const DEFAULT_SPACE_EDITOR_BAR_POSITION = 8;

function transformSongData(dragStartYPos, draggedDistance) {
  const transformedSongData = {};
  const noteStatuses = {};
  const pitchArray = Object.keys(musicBoxStore.state.songState.songData);

  pitchArray.forEach((pitchId) => {
    const noteStatusArray = [];
    const notesArray = musicBoxStore.state.songState.songData[pitchId];
    const transformedNotes = notesArray.map(noteYPos => {
      let status = 'unaltered';
      let newNoteYPos = noteYPos;

      if (noteYPos > dragStartYPos) {
        status = 'altered';
        newNoteYPos = noteYPos + draggedDistance;
      }

      noteStatusArray.push(status);
      return newNoteYPos;
    });

    transformedSongData[pitchId] = transformedNotes;
    noteStatuses[pitchId] = noteStatusArray;
  });

  return [transformedSongData, noteStatuses];
}

export class SpaceEditor extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#space-editor')
    });

    musicBoxStore.subscribe("songState.songData*", debounce(this.render.bind(this), WAIT_FOR_STATE));

    this.dragStartYPos = null;
    // cached to prevent unnecessary re-renders
    this.lastSnappedBarYPos = null;

    // cached to prevent repetitive DOM queries
    this.editorDragZoneEl = null;
    this.editorBarEl = null;

    // When space is edited, the SpaceEditor is re-rendered underneath the cursor.
    // In this situation, the mouse events won't fire until you move the mouse again.
    // This led to an edge-case where the space-editor-bar wasn't positioned properly
    // on re-renders. To fix this, we store the last space-editor-bar position and use
    // it to set the initial space-editor-bar position during render.
    this.lastEditorBarPosition = DEFAULT_SPACE_EDITOR_BAR_POSITION;
    this.lastEditorBarVisibilityClass = '';

    // Throttle the dragging event to reduce re-renders (while snapping is set to none).
    // We could throttle mousemove, but there's little benefit (mousemove alone has very
    // little processing) and it makes hovering feel a bit less smooth.
    this.handleDragging = throttle(this.handleDragging.bind(this), 25);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.showEditorBar = this.showEditorBar.bind(this);
  }

  handleDragging(snappedBarYPos) {
    // Prevent unnecessary SpaceEditorPreview re-renders
    if (snappedBarYPos === this.lastSnappedBarYPos) return;
    this.lastSnappedBarYPos = snappedBarYPos;

    // Render preview lines
    const draggedDistance = snappedBarYPos - this.dragStartYPos;
    const [previewSongData, noteStatuses] = transformSongData(this.dragStartYPos, draggedDistance);
    musicBoxStore.publish('SpaceEditorPreview', { previewSongData, noteStatuses });

    // Resize drag zone
    const newFinalNotePosition = getFinalNoteYPos() + draggedDistance;
    this.editorDragZoneEl.style.height = `${newFinalNotePosition}px`;
    this.editorDragZoneEl.classList.add('is-dragging');

    // Resize paper if necessary
    resizePaperIfNeeded(newFinalNotePosition);
  }

  handleMouseMove(event) {
    const relativeBarYPos = event.offsetY;
    const snappedBarYPos = snapToInterval(relativeBarYPos, event);

    // have bar follow cursor
    this.editorBarEl.style = `transform: translateY(${snappedBarYPos}px)`;

    if (this.isDragging()) {
      this.handleDragging(snappedBarYPos);
    }
  }

  handleMouseDown(event) {
    if (musicBoxStore.state.appState.isTextSelectionEnabled) {
      musicBoxStore.setState('appState.isTextSelectionEnabled', false);
    }
    if (musicBoxStore.state.appState.isPlaying) {
      musicBoxStore.setState('appState.isPlaying', false);
    }

    const relativeBarYPos = event.offsetY;
    const snappedBarYPos = snapToInterval(relativeBarYPos, event);
    this.dragStartYPos = snappedBarYPos;
    this.handleDragging(snappedBarYPos);
  }

  // Originally we managed editor bar visible with CSS only, but we ran into
  // some edge-cases which required JS to resolve (specifically, visibility on
  // mobile and incorrect editor bar position when exiting a note selection box).
  showEditorBar(event) {
    // Keep the editor bar hidden on touch devices for now.
    if (event.pointerType === 'touch') return;

    this.editorBarEl.classList.add('is-visible');
    this.lastEditorBarVisibilityClass = 'is-visible';

    // Ensures the bar is positioned correctly
    this.handleMouseMove(event);
  }

  handleMouseUp(event) {
    if (this.isDragging()) {
      // Save editor bar position
      const relativeBarYPos = event.offsetY;
      const snappedBarYPos = snapToInterval(relativeBarYPos, event);
      this.lastEditorBarPosition = snappedBarYPos;

      // Save new song data
      const draggedDistance = snappedBarYPos - this.dragStartYPos;
      const [transformedSongData] = transformSongData(this.dragStartYPos, draggedDistance);
      const isSaved = musicBoxStore.setState('songState.songData', dedupeAndSortSongData(transformedSongData));
      if (!isSaved) {
        // If no modifications were made, we force-clear the preview lines. If modifications
        // were made, then the rerender of the note-lines will clear the preview lines.
        musicBoxStore.publish('SpaceEditorPreview', null);
      }

      // Reset
      this.resetDragging();
    }
  }

  handleMouseOut() {
    if (this.isDragging()) {
      // If we dragged out of bounds, force-clear the preview lines
      musicBoxStore.publish('SpaceEditorPreview', null);

      this.resetDragging();
    }

    this.editorBarEl.classList.remove('is-visible');
    this.lastEditorBarVisibilityClass = '';
  }

  isDragging() {
    return this.dragStartYPos !== null;
  }

  resetDragging() {
    this.dragStartYPos = null;
    this.lastSnappedBarYPos = null;
    this.editorDragZoneEl.style.height = `${getFinalNoteYPos()}px`;
    this.editorDragZoneEl.classList.remove('is-dragging');

    if (!musicBoxStore.state.appState.isTextSelectionEnabled) {
      musicBoxStore.setState('appState.isTextSelectionEnabled', true);
    }
  }

  render() {
    this.element.innerHTML = `
      <div class="space-editor-drag-zone" title="Add space"></div>
      <div class="space-editor-bar ${this.lastEditorBarVisibilityClass}" style="transform: translateY(${this.lastEditorBarPosition}px)"></div>
    `;

    this.editorDragZoneEl = this.element.querySelector('.space-editor-drag-zone');
    this.editorBarEl = this.element.querySelector('.space-editor-bar');

    this.editorDragZoneEl.style.height = `${getFinalNoteYPos()}px`;

    this.editorDragZoneEl.addEventListener('pointerenter', this.showEditorBar);
    this.editorDragZoneEl.addEventListener('mousemove', this.handleMouseMove);
    this.editorDragZoneEl.addEventListener('mousedown', this.handleMouseDown);
    this.editorDragZoneEl.addEventListener('mouseup', this.handleMouseUp);
    this.editorDragZoneEl.addEventListener('mouseout', this.handleMouseOut);
  }
}

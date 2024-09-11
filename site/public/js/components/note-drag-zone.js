import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { getFinalNoteYPos, sortSongData } from '../common/notes.js';
import { snapToInterval } from "../common/snap-to-interval.js";
import { resizePaperIfNeeded } from '../common/pages.js';
import { getRelativeYPos } from '../common/common-event-handlers.js';
import { throttle } from '../utils/throttle.js';
import { NOTE_STARTING_THRESHOLD } from '../constants.js';

function transformSongData(draggedDistance) {
  const transformedSongData = {};
  const noteStatuses = {};
  const pitchArray = Object.keys(musicBoxStore.state.songState.songData);

  pitchArray.forEach((pitchId) => {
    const noteStatusArray = [];
    const notesArray = musicBoxStore.state.songState.songData[pitchId];
    const selectedNotesArray = [...musicBoxStore.state.appState.selectedNotes[pitchId]];
    const transformedNotes = notesArray.map(noteYPos => {
      let status = 'unaltered';
      let newNoteYPos = noteYPos;

      if (selectedNotesArray.includes(noteYPos)) {
        status = 'altered_selected';
        newNoteYPos = noteYPos + draggedDistance;
        selectedNotesArray.splice(selectedNotesArray.indexOf(noteYPos), 1);
      }

      noteStatusArray.push(status);
      return newNoteYPos;
    });

    transformedSongData[pitchId] = transformedNotes;
    noteStatuses[pitchId] = noteStatusArray;
  });

  return [transformedSongData, noteStatuses];
}

export class NoteDragZone extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#note-drag-zone'),
      renderTrigger: 'appState.selectedNotesDragStartPos'
    });

    // Throttle the dragging event to reduce SpaceEditorPreview re-renders
    // (at least, while snapping is set to none).
    this.handleDragging = throttle(this.handleDragging.bind(this), 25);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);

    this.firstSelectedNoteYPos = null;
  }

  getDraggedDistance(event) {
    const grabbedNoteStartYpos = musicBoxStore.state.appState.selectedNotesDragStartPos;
    const relativeCursorYpos = getRelativeYPos(event);
    const grabbedNoteUpperThreshold = grabbedNoteStartYpos + NOTE_STARTING_THRESHOLD - this.firstSelectedNoteYPos;
    const thresholdedCursorYPos = Math.max(relativeCursorYpos, grabbedNoteUpperThreshold);
    const snappedCursorYPos = snapToInterval(thresholdedCursorYPos, event);
    const draggedDistance = snappedCursorYPos - grabbedNoteStartYpos;
    return draggedDistance;
  }

  handleDragging(event) {
    const draggedDistance = this.getDraggedDistance(event);

    // Prevent unnecessary SpaceEditorPreview re-renders
    if (draggedDistance === this.lastSnappedDraggedDistance) return;
    this.lastSnappedDraggedDistance = draggedDistance;

    // Render preview lines
    const [previewSongData, noteStatuses] = transformSongData(draggedDistance);
    musicBoxStore.publish('SpaceEditorPreview', { previewSongData, noteStatuses });

    // Resize paper if needed
    const newFinalNotePosition = getFinalNoteYPos() + draggedDistance;
    resizePaperIfNeeded(newFinalNotePosition);
  }

  handleMouseUp(event) {
    const draggedDistance = this.getDraggedDistance(event);

    if (draggedDistance === 0) {
      musicBoxStore.publish('SpaceEditorPreview', null); // Remove preview lines
      this.resetDragging();
      return;
    }

    // Calculate new song data
    const [transformedSongData] = transformSongData(draggedDistance);

    // Calculate new selected notes
    let newSelectedNotes = {};
    Object.entries(musicBoxStore.state.appState.selectedNotes).forEach(([pitchId, selectedNotesArray]) => {
      newSelectedNotes[pitchId] = selectedNotesArray.map(noteYPos => noteYPos + draggedDistance);
    });

    // Save new data
    // By setting musicBoxStore.state.appState.selectedNotes directly (instead of calling
    // setState) we update that state without triggering any re-renders. This is usually
    // not what we want, but in this case we do it because we know the note lines will be
    // re-rendered when we save the new song data below. This way we don't trigger double-
    // renders for no reason.
    musicBoxStore.state.appState.selectedNotes = newSelectedNotes;
    musicBoxStore.setState('songState.songData', sortSongData(transformedSongData));

    // Reset dragging.
    this.resetDragging();
  }

  handleMouseOut() {
    // If we dragged out of bounds, force-clear the preview lines
    musicBoxStore.publish('SpaceEditorPreview', null);

    this.resetDragging();
  }

  setupDragging() {
    this.firstSelectedNoteYPos = Object.values(musicBoxStore.state.appState.selectedNotes).flat().sort((a, b) => a - b)[0];

    if (musicBoxStore.state.appState.isTextSelectionEnabled) {
      musicBoxStore.setState('appState.isTextSelectionEnabled', false);
    }

    // Pre-load the preview lines with a dragged distance of 0.
    const [previewSongData, noteStatuses] = transformSongData(0);
    musicBoxStore.publish('SpaceEditorPreview', { previewSongData, noteStatuses });
  }

  resetDragging() {
    this.firstSelectedNoteYPos === null;

    if (!musicBoxStore.state.appState.isTextSelectionEnabled) {
      musicBoxStore.setState('appState.isTextSelectionEnabled', true);
    }

    // reset the drag zone (by calling render())
    musicBoxStore.setState('appState.selectedNotesDragStartPos', null);
  }

  render() {
    if (musicBoxStore.state.appState.selectedNotesDragStartPos !== null) {
      // One-time dragging set-up. We run this code here (instead of on mouseenter) b/c Safari
      // doesn't trigger mouseenter when an element appears behind a stationary cursor.
      this.setupDragging();
      this.element.classList.add('is-dragging');
    } else {
      this.element.classList.remove('is-dragging');
    }

    this.element.addEventListener('mousemove', this.handleDragging);
    this.element.addEventListener('mouseup', this.handleMouseUp);
    this.element.addEventListener('mouseout', this.handleMouseOut);
  }
}

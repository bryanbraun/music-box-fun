import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { forEachNotes, getFinalNoteYPos, isNotePositionSilent, setSelectedNotesAndSongDataState } from '../common/notes.js';
import { snapToInterval, snapToNextInterval } from "../common/snap-to-interval.js";
import { resizePaperIfNeeded } from '../common/pages.js';
import { getRelativeYPos } from '../common/common-event-handlers.js';
import { throttle } from '../utils.js';
import { NOTE_STARTING_THRESHOLD } from '../constants.js';

function transformSongData(draggedDistance) {
  const transformedSongData = {};
  const noteStatuses = {};
  const pitchArray = Object.keys(musicBoxStore.state.songState.songData);

  pitchArray.forEach((pitchId) => {
    const noteStatusArray = [];
    const transformedNotesArray = [];
    const notesArray = musicBoxStore.state.songState.songData[pitchId];
    const selectedNotesArray = [...musicBoxStore.state.appState.selectedNotes[pitchId]];

    notesArray.forEach(noteYPos => {
      let status = 'unaltered';
      let newNoteYPos = noteYPos;

      if (selectedNotesArray.includes(noteYPos)) {
        status = 'altered_selected';
        newNoteYPos = noteYPos + draggedDistance;
        selectedNotesArray.splice(selectedNotesArray.indexOf(noteYPos), 1);
      }

      transformedNotesArray.push(newNoteYPos);

      const newNoteIndex = transformedNotesArray.sort((a, b) => a - b).lastIndexOf(newNoteYPos);

      noteStatusArray.splice(newNoteIndex, 0, status);
    });

    // After moving all notes, check whether any non-dragged notes were altered.
    forEachNotes(transformedNotesArray, (transformedNoteYPos, transformedNoteIsSilent, index) => {
      // Only check notes that weren't dragged.
      if (!notesArray.includes(transformedNoteYPos)) return;

      // Ignore this note if the silent-status was unchanged.
      if (transformedNoteIsSilent === isNotePositionSilent(transformedNoteYPos, notesArray)) return;

      // Mark this note as altered (without overriding any 'altered_selected' statuses).
      if (noteStatusArray[index] === 'unaltered') {
        noteStatusArray[index] = 'altered';
      }
    });

    transformedSongData[pitchId] = transformedNotesArray;
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
    let snappedCursorYPos = snapToInterval(thresholdedCursorYPos, event);

    // Prevent snap-to-interval from snapping notes above the starting threshold.
    if (snappedCursorYPos < grabbedNoteUpperThreshold) {
      snappedCursorYPos = snapToNextInterval(thresholdedCursorYPos, event);
    }

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
    const newFinalNotePosition = getFinalNoteYPos(previewSongData);
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

    Object.entries(musicBoxStore.state.appState.selectedNotes).forEach(([pitchId, selectedNotesArray]) => {
      // Calculate new selected notes
      const newSelectedNotesArray = selectedNotesArray.map(noteYPos => noteYPos + draggedDistance);

      // Save new selected notes and song data
      setSelectedNotesAndSongDataState(pitchId, newSelectedNotesArray, transformedSongData[pitchId]);
    });

    // Remove preview lines.
    musicBoxStore.publish('SpaceEditorPreview', null);

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
    const isDragging = musicBoxStore.state.appState.selectedNotesDragStartPos !== null;

    if (isDragging) {
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

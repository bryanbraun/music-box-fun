import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { getRelativeYPos } from '../common/common-event-handlers.js';
import { getFinalNoteYPos } from '../common/notes.js';
import { snapToInterval } from "../common/snap-to-interval.js";
import { getCurrentPitchArray } from '../common/box-types.js';
import { getNumberOfPagesOnScreen, getFinalBarLineYPos } from '../common/pages.js';
import { throttle } from '../utils/throttle.js';
import { debounce } from '../utils/debounce.js';
import { NOTE_LINE_STARTING_GAP, NUMBER_OF_BARS_PER_PAGE, QUARTER_BAR_GAP, WAIT_FOR_STATE } from '../common/constants.js';

const DEFAULT_SPACE_EDITOR_BAR_POSITION = 8;

function transformSongData(dragStartYPos, draggedDistance) {
  const transformedSongData = {};
  const noteStatuses = {};

  // @TODO: if order of pitches in pitch Array doesn't matter (and I think it doesn't),
  //        we can use Object.keys(songData) and potentially save some processing.
  const pitchArray = getCurrentPitchArray();

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

function formatSongDataForSaving(songData) {
  const formattedSongData = {};

  Object.keys(songData).forEach((pitchId) => {
    const dedupedNotesArray = Array.from(new Set(songData[pitchId]));
    const sortedNotesArray = dedupedNotesArray.sort((a, b) => a - b);
    formattedSongData[pitchId] = sortedNotesArray;
  });

  return formattedSongData;
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
    this.lastSpaceEditorBarPosition = DEFAULT_SPACE_EDITOR_BAR_POSITION;

    // Throttle the dragging event to reduce re-renders (while snapping is set to none).
    // We could throttle mousemove, but there's little benefit (mousemove alone has very
    // little processing) and it makes hovering feel a bit less smooth.
    this.handleDragging = throttle(this.handleDragging.bind(this), 25);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  handleDragging(snappedBarYPos) {
    // Prevent unnecessary re-renders
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
    const lastPageThreshold = getFinalBarLineYPos();
    const currentNumberOfPages = getNumberOfPagesOnScreen();
    const minNumberOfPagesNeeded = Math.ceil((newFinalNotePosition - NOTE_LINE_STARTING_GAP) / (NUMBER_OF_BARS_PER_PAGE * QUARTER_BAR_GAP)) || 1;

    if (newFinalNotePosition > lastPageThreshold) {
      // Publish a one-off event telling the PaperFooter to re-render at a bigger size.
      musicBoxStore.publish('ResizePaper', currentNumberOfPages + 1);
    }

    if (currentNumberOfPages > minNumberOfPagesNeeded) {
      // Publish a one-off event telling the PaperFooter to re-render at a smaller size.
      musicBoxStore.publish('ResizePaper', minNumberOfPagesNeeded);
    }
  }

  handleMouseMove(event) {
    const relativeBarYPos = getRelativeYPos(event);

    // @TODO: relativeBarYPos seems the exact same as event.offsetY. Can I just use that?
    //        If so, can I use that everywhere I use getRelativeYPos?
    console.log({ relativeYPos: relativeBarYPos, offsetY: event.offsetY });

    const snappedBarYPos = snapToInterval(relativeBarYPos, event);

    // have bar follow cursor
    this.editorBarEl.style = `transform: translateY(${snappedBarYPos}px)`;

    if (this.isDragging()) {
      this.handleDragging(snappedBarYPos);
    }
  }

  handleMouseDown(event) {
    if (musicBoxStore.state.appState.isPlaying) {
      musicBoxStore.setState('appState.isPlaying', false);
    }

    const relativeBarYPos = getRelativeYPos(event);
    const snappedBarYPos = snapToInterval(relativeBarYPos, event);
    this.dragStartYPos = snappedBarYPos;
    this.handleDragging(snappedBarYPos);
  }

  handleMouseUp(event) {
    if (this.isDragging()) {
      // Save editor bar position
      const relativeBarYPos = getRelativeYPos(event);
      const snappedBarYPos = snapToInterval(relativeBarYPos, event);
      this.lastSpaceEditorBarPosition = snappedBarYPos;

      // Save new song data
      const draggedDistance = snappedBarYPos - this.dragStartYPos;
      const [transformedSongData] = transformSongData(this.dragStartYPos, draggedDistance);
      const isSaved = musicBoxStore.setState('songState.songData', formatSongDataForSaving(transformedSongData));
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
  }

  isDragging() {
    return this.dragStartYPos !== null;
  }

  resetDragging() {
    this.dragStartYPos = null;
    this.lastSnappedBarYPos = null;
    this.editorDragZoneEl.style.height = `${getFinalNoteYPos()}px`;
    this.editorDragZoneEl.classList.remove('is-dragging');
  }

  render() {
    this.element.innerHTML = `
      <div class="space-editor-drag-zone" title="Add space"></div>
      <div class="space-editor-bar" style="transform: translateY(${this.lastSpaceEditorBarPosition}px)"></div>
    `;

    this.editorDragZoneEl = this.element.querySelector('.space-editor-drag-zone');
    this.editorBarEl = this.element.querySelector('.space-editor-bar');

    this.editorDragZoneEl.style.height = `${getFinalNoteYPos()}px`;

    this.editorDragZoneEl.addEventListener('mousemove', this.handleMouseMove);
    this.editorDragZoneEl.addEventListener('mousedown', this.handleMouseDown);
    this.editorDragZoneEl.addEventListener('mouseup', this.handleMouseUp);
    this.editorDragZoneEl.addEventListener('mouseout', this.handleMouseOut);
  }
}

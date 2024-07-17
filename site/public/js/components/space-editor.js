import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { SpaceEditorNoteLinesPreview } from './space-editor-note-lines-preview.js';
import { getRelativeYPos } from '../common/common-event-handlers.js';
import { getFinalNoteYPos } from '../common/notes.js';
import { snapToInterval } from "../common/snap-to-interval.js";
import { getCurrentPitchArray } from '../common/box-types.js';
import { NOTE_LINE_STARTING_GAP, NUMBER_OF_BARS_PER_PAGE, QUARTER_BAR_GAP } from '../common/constants.js';

const DEFAULT_SPACE_EDITOR_BAR_POSITION = 8;

function transformSongData(dragStartYPos, draggedDistance) {
  const transformedSongData = {};
  const noteStatuses = {};
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

function dedupeSongData(songData) {
  const dedupedSongData = {};

  Object.keys(songData).forEach((pitchId) => {
    const dedupedNotesArray = Array.from(new Set(songData[pitchId]));
    dedupedSongData[pitchId] = dedupedNotesArray;
  });

  return dedupedSongData;
}

// @TODO: A similar calculation is done in paper-footer and note-line.js, so we could possibly consolidate.
function getNumberOfBars() {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--number-of-bars'));
}

export class SpaceEditor extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState.songData*',
      element: document.querySelector('#space-editor')
    });

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);

    this.dragStartYPos = null;
    this.NoteLinesPreview = null; // placeholder for preview component
    this.editorBarEl = null; // cached to prevent repetitive lookups

    // When space is edited, the SpaceEditor is re-rendered underneath the cursor.
    // In this situation, the mouse events won't fire until you move the mouse again.
    // This led to an edge-case where the space-editor-bar wasn't positioned properly
    // on re-renders. To fix this, we store the last space-editor-bar position and use
    // it to set the initial space-editor-bar position during render.
    this.lastSpaceEditorBarPosition = DEFAULT_SPACE_EDITOR_BAR_POSITION;
  }

  handleDragging(event) {
    const relativeBarYPos = getRelativeYPos(event);
    const snappedBarYPos = snapToInterval(relativeBarYPos, event);
    const draggedDistance = snappedBarYPos - this.dragStartYPos;
    const [songData, noteStatuses] = transformSongData(this.dragStartYPos, draggedDistance);

    this.NoteLinesPreview.render({ songData, noteStatuses });
    this.NoteLinesPreview.show();

    // @todo: calculate getFinalNoteYPos only on render (and cache value) for performance?
    const finalNoteYPos = getFinalNoteYPos();
    const newFinalNotePosition = finalNoteYPos + draggedDistance;
    this.element.style.height = `${newFinalNotePosition}px`;
    const lastPageThreshold = NOTE_LINE_STARTING_GAP + (getNumberOfBars() * QUARTER_BAR_GAP);
    // @TODO: this is similar to getNumberOfPagesFromScreen from paper-footer, so maybe consolidate?
    const currentNumberOfPages = getNumberOfBars() / NUMBER_OF_BARS_PER_PAGE;

    // If final preview note belongs on a new page, and we don't have a new page, add a new page.
    if (newFinalNotePosition > lastPageThreshold) {
      // Publish a one-off event telling the PaperFooter to re-render at a bigger size.
      musicBoxStore.publish('ResizePaper', currentNumberOfPages + 1);
    }

    const maxFinalNoteYpos = Math.max(finalNoteYPos, newFinalNotePosition);
    // @TODO: this is similar to getNumberOfPagesFromSongData from paper-footer, so maybe consolidate?
    const minNumberOfPagesNeeded = Math.ceil((maxFinalNoteYpos - NOTE_LINE_STARTING_GAP) / (NUMBER_OF_BARS_PER_PAGE * QUARTER_BAR_GAP)) || 1;

    if (currentNumberOfPages > minNumberOfPagesNeeded) {
      // Publish a one-off event telling the PaperFooter to re-render at a smaller size.
      musicBoxStore.publish('ResizePaper', minNumberOfPagesNeeded);
    }
  }

  // @todo: throttle this for performance?
  //        ALSO, only rerender on snap interval changes instead of every pixel dragged?
  //          We can do this by storing the last snappedBarYPos and only rerender if it changes?
  handleMouseMove(event) {
    const relativeBarYPos = getRelativeYPos(event);
    const snappedBarYPos = snapToInterval(relativeBarYPos, event);

    // have bar follow cursor
    this.editorBarEl.style = `transform: translateY(${snappedBarYPos}px)`;

    if (this.isDragging()) {
      this.handleDragging(event);
    }
  }

  handleMouseDown(event) {
    if (musicBoxStore.state.appState.isPlaying) {
      musicBoxStore.setState('appState.isPlaying', false);
    }

    const relativeBarYPos = getRelativeYPos(event);
    this.dragStartYPos = snapToInterval(relativeBarYPos, event);
    this.handleDragging(event);
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
      musicBoxStore.setState('songState.songData', dedupeSongData(transformedSongData));

      // Reset
      this.resetDragging();
    }
  }

  // @TODO: improve dragging by allowing the bar to be dragged outside of the lane?
  //        That's how google sheets works, but possibly it adds unnecessary complexity.
  handleMouseOut() {
    this.resetDragging();
  }

  isDragging() {
    return this.dragStartYPos !== null;
  }

  resetDragging() {
    this.NoteLinesPreview.hide();
    this.dragStartYPos = null;
    this.element.style.height = `${getFinalNoteYPos()}px`;
  }

  render() {
    console.log('SpaceEditor was rendered');

    this.element.style.height = `${getFinalNoteYPos()}px`;
    this.element.innerHTML = `
      <div class="space-editor-notes-preview"></div>
      <div class="space-editor-bar" style="transform: translateY(${this.lastSpaceEditorBarPosition}px)"></div>
    `;

    this.element.addEventListener('mousemove', this.handleMouseMove);
    this.element.addEventListener('mousedown', this.handleMouseDown);
    this.element.addEventListener('mouseup', this.handleMouseUp);
    this.element.addEventListener('mouseout', this.handleMouseOut);

    this.editorBarEl = this.element.querySelector('.space-editor-bar');

    this.NoteLinesPreview = new SpaceEditorNoteLinesPreview({
      element: this.element.querySelector('.space-editor-notes-preview')
    });
  }
}

import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
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

function formatSongDataForSaving(songData) {
  const formattedSongData = {};

  Object.keys(songData).forEach((pitchId) => {
    const dedupedNotesArray = Array.from(new Set(songData[pitchId]));
    const sortedNotesArray = dedupedNotesArray.sort((a, b) => a - b);
    formattedSongData[pitchId] = sortedNotesArray;
  });

  return formattedSongData;
}

// @TODO: A similar calculation is done in paper-footer and note-line.js, so we could possibly consolidate.
// Possibly we could use a "common/pages.js" file for this stuff?
function getNumberOfBars() {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--number-of-bars'));
}

export class SpaceEditor extends MBComponent {
  constructor() {
    super({
      // TODO: whenever we edit space, this component gets re-rendered once per note line
      //       containing a moved note. This feels excessive. Is there a way to reduce this?
      renderTrigger: 'songState.songData*',
      element: document.querySelector('#space-editor')
    });

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);

    this.dragStartYPos = null;
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
    const [previewSongData, noteStatuses] = transformSongData(this.dragStartYPos, draggedDistance);

    musicBoxStore.publish('SpaceEditorPreview', { previewSongData, noteStatuses });

    // @todo: calculate getFinalNoteYPos only on render (and cache value) for performance?
    const finalNoteYPos = getFinalNoteYPos();
    const newFinalNotePosition = finalNoteYPos + draggedDistance;
    this.element.style.height = `${newFinalNotePosition}px`;
    const lastPageThreshold = NOTE_LINE_STARTING_GAP + (getNumberOfBars() * QUARTER_BAR_GAP);
    // @TODO: this is similar to getNumberOfPagesFromScreen from paper-footer, so maybe consolidate?
    const currentNumberOfPages = getNumberOfBars() / NUMBER_OF_BARS_PER_PAGE;
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

  // @todo: throttle this for performance?
  //    ALSO, only rerender on snap interval changes instead of every pixel dragged?
  //       We can do this by storing the last snappedBarYPos and only rerender if it changes?
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
      const isSaved = musicBoxStore.setState('songState.songData', formatSongDataForSaving(transformedSongData));

      if (!isSaved) {
        // If no modifications were made, we force-clear the preview lines (which renders normal note-lines).
        musicBoxStore.publish('SpaceEditorPreview', null);
      }

      // Reset
      this.resetDragging();
    }
  }

  // @TODO: improve dragging by allowing the bar to be dragged outside of the lane?
  //        That's how google sheets works, but possibly it adds unnecessary complexity.
  handleMouseOut() {
    this.resetDragging();
    musicBoxStore.publish('SpaceEditorPreview', null); // force-clear the preview lines
  }

  isDragging() {
    return this.dragStartYPos !== null;
  }

  resetDragging() {
    this.dragStartYPos = null;
    this.element.style.height = `${getFinalNoteYPos()}px`;
  }

  render() {
    console.log('SpaceEditor was rendered');

    this.element.style.height = `${getFinalNoteYPos()}px`;
    this.element.innerHTML = `
      <div class="space-editor-bar" style="transform: translateY(${this.lastSpaceEditorBarPosition}px)"></div>
    `;

    this.element.addEventListener('mousemove', this.handleMouseMove);
    this.element.addEventListener('mousedown', this.handleMouseDown);
    this.element.addEventListener('mouseup', this.handleMouseUp);
    this.element.addEventListener('mouseout', this.handleMouseOut);

    this.editorBarEl = this.element.querySelector('.space-editor-bar');
  }
}

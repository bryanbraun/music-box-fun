import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { SpaceEditorNoteLinesPreview, transformSongData } from './space-editor-note-lines-preview.js';
import { getRelativeYPos } from '../common/common-event-handlers.js';
import { snapToInterval } from "../common/snap-to-interval.js";

const DEFAULT_SPACE_EDITOR_BAR_POSITION = 8;

export class SpaceEditor extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState.songData*',
      element: document.querySelector('#space-editor')
    });

    // Using local state? Set the initial values here in the constructor.
    // this.state.counter = 0;

    // To use "this" inside of our methods, bind it here in the constructor.
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

  getFinalNoteYPos() {
    let finalNoteYPos = 0;

    Object.values(musicBoxStore.state.songState.songData).forEach((noteLine) => {
      finalNoteYPos = Math.max(finalNoteYPos, noteLine[noteLine.length - 1] || 0);
    });

    return finalNoteYPos; // Returns zero if the song is empty.
  }

  handleDragging(event) {
    const relativeBarYPos = getRelativeYPos(event);
    const snappedBarYPos = snapToInterval(relativeBarYPos, event);
    const draggedDistance = snappedBarYPos - this.dragStartYPos;
    const [songData, noteStatuses] = transformSongData(this.dragStartYPos, draggedDistance);

    this.NoteLinesPreview.render({ songData, noteStatuses });
    this.NoteLinesPreview.show();

    // @todo: calculate getFinalNoteYPos only on render (and cache value) for performance?
    const newFinalNotePosition = this.getFinalNoteYPos() + draggedDistance;
    this.element.style.height = `${newFinalNotePosition}px`;
  }

  // @todo: throttle this for performance?
  //        OR, only rerender on snap interval changes instead of every pixel dragged?
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
      musicBoxStore.setState('songState.songData', transformedSongData);

      // Reset
      this.resetDragging();
    }
  }

  // @TODO: improve dragging by allowing the bar to be dragged outside of the lane?
  //        That's how google sheets works, but possibly it adds unnecessary complexity.
  handleMouseOut() {
    // For now: reset dragging when the mouse leaves the lane.
    this.resetDragging();
  }

  isDragging() {
    return this.dragStartYPos !== null;
  }

  resetDragging() {
    this.NoteLinesPreview.hide();
    this.dragStartYPos = null;
    this.element.style.height = `${this.getFinalNoteYPos()}px`;
  }

  render() {
    console.log('SpaceEditor was rendered');

    this.element.style.height = `${this.getFinalNoteYPos()}px`;
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

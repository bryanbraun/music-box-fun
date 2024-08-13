import classNames from '../vendor/classnames.js';
import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { playheadObserver } from '../common/playhead-observer.js';
import { sampler, isSamplerLoaded } from '../common/sampler.js';
import { snapToInterval } from '../common/snap-to-interval.js';
import { forEachNotes, isNotePositionSilent, getNoteYPos } from '../common/notes.js';
import { getFinalBarLineYPos } from '../common/pages.js';
import { NOTE_LINE_STARTING_GAP } from '../common/constants.js';

const DEFAULT_SHADOW_NOTE_POSITION = 8;

export class NoteLine extends MBComponent {
  constructor(props) {
    super({
      props,
      renderTrigger: [`songState.songData.${props.id}`, `appState.selectedNotes.${props.id}`],
      element: document.getElementById(props.id)
    });

    // We need to bind these in order to use "this" inside of them.
    this.showShadowNote = this.showShadowNote.bind(this);
    this.hideShadowNote = this.hideShadowNote.bind(this);
    this.haveShadowNoteFollowCursor = this.haveShadowNoteFollowCursor.bind(this);
    this.handleClick = this.handleClick.bind(this);

    // When a note is added or removed, the NoteLine is re-rendered underneath the cursor.
    // In this situation, the mouse events won't fire until you move the mouse again (at
    // least, in some browsers like Safari). This led to some edge-cases where the shadow
    // note wasn't being positioned properly during repeated clicks. To fix this, we store
    // the last shadow note position (and visibility) details, so we can use them to set
    // the initial shadow note position during re-renders.
    this.lastShadowNotePosition = DEFAULT_SHADOW_NOTE_POSITION;
    this.lastShadowNoteVisibilityClass = '';
  }

  getNoteLineHeight() {
    return parseInt(getComputedStyle(this.element).getPropertyValue('height').trim());
  }

  showShadowNote(event) {
    // This gives us "invisible shadow notes" on touch devices only. It fixes a bug
    // where shadow notes would remain visible on touchscreens after removing notes.
    if (event.pointerType === 'touch') return;

    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    this.lastShadowNoteVisibilityClass = 'shadow-note--visible';
    shadowNoteEl.classList.add('shadow-note--visible');

    this.positionShadowNote(shadowNoteEl, event);
  }

  hideShadowNote(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    this.lastShadowNotePosition = DEFAULT_SHADOW_NOTE_POSITION;
    this.lastShadowNoteVisibilityClass = '';
    shadowNoteEl.style = `transform: translateY(${DEFAULT_SHADOW_NOTE_POSITION}px)`;
    shadowNoteEl.classList.remove('shadow-note--visible');
  }

  haveShadowNoteFollowCursor(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    this.positionShadowNote(shadowNoteEl, event);
  }

  positionShadowNote(shadowNoteEl, mouseEvent) {
    let relativeCursorYPos = mouseEvent.offsetY;

    // We define thresholds that shadow notes can't be placed above or below. This prevents
    // bugs like the hole getting cut off at the top or being placed below the footer button.
    const SHADOW_NOTE_STARTING_THRESHOLD = NOTE_LINE_STARTING_GAP / 2;
    const SHADOW_NOTE_ENDING_THRESHOLD = getFinalBarLineYPos();

    if (relativeCursorYPos < SHADOW_NOTE_STARTING_THRESHOLD) {
      // If the cursor is positioned too high on the note line, we pretend that it is
      // positioned at the starting threshold, making it impossible to place notes any higher.
      relativeCursorYPos = SHADOW_NOTE_STARTING_THRESHOLD;
    }

    if (relativeCursorYPos > SHADOW_NOTE_ENDING_THRESHOLD) {
      // If the cursor is positioned too low on the note line, we pretend that it is
      // positioned at the ending threshold, making it impossible to place notes any lower.
      relativeCursorYPos = SHADOW_NOTE_ENDING_THRESHOLD;
    }

    const shadowNoteYPosition = snapToInterval(relativeCursorYPos, mouseEvent);

    this.lastShadowNotePosition = shadowNoteYPosition;
    shadowNoteEl.style = `transform: translateY(${shadowNoteYPosition}px)`;
  }

  handleClick(event) {
    const noteLineEl = event.currentTarget;
    const shadowNoteEl = noteLineEl.querySelector('.shadow-note');
    const clickedEl = event.target;
    const pitch = noteLineEl.id;
    const shadowNoteYPos = getNoteYPos(shadowNoteEl);
    const isShadowNoteOverlappingExistingNote = musicBoxStore.state.songState.songData[pitch].includes(shadowNoteYPos);

    if (clickedEl.classList.contains('hole')) {
      this.removeNote(pitch, getNoteYPos(clickedEl));
    }
    else if (isShadowNoteOverlappingExistingNote) {
      // This case happens when snap-to-grid allows you to click when your
      // cursor isn't on an existing note but your shadow note is.
      this.removeNote(pitch, shadowNoteYPos);
    }
    else {
      this.addNote(pitch, shadowNoteYPos)
    }
  }

  addNote(pitch, yPos) {
    const newPitchArray = [...musicBoxStore.state.songState.songData[pitch]]
      .concat(yPos)
      .sort((a, b) => Number(a) - Number(b));

    if (!isNotePositionSilent(yPos, newPitchArray)) {
      isSamplerLoaded && sampler.triggerAttackRelease(pitch, '8n');
    }

    musicBoxStore.setState(`songState.songData.${pitch}`, newPitchArray);
  }

  removeNote(pitch, yPos) {
    const newPitchArray = [...musicBoxStore.state.songState.songData[pitch]]
      .filter(val => val !== yPos);

    musicBoxStore.setState(`songState.songData.${pitch}`, newPitchArray);
  }

  // The yPos value stored in songData is the center of the hole (the moment when the note plays).
  // This is ideal for ToneJS and makes sense for a UI with a variety of hole sizes. Normally, we
  // couldn't use this position as a translateY value, because translateY references the top (not
  // center) of an element. In our case, we use a CSS 'top' offset to adjust all notes (based on
  // their width), allowing us to use note centers as translateY values. As a result, all yPos
  // variables in this file refer to the center of the note, not the top.
  renderNotes(pitch) {
    const notesArray = musicBoxStore.state.songState.songData[pitch];
    const selectedNotesArray = musicBoxStore.state.appState.selectedNotes[pitch];
    let notesMarkup = '';

    forEachNotes(notesArray, (yPos, isSilent) => {
      const noteClasses = classNames('hole', {
        "is-selected": selectedNotesArray && selectedNotesArray.includes(yPos),
        "is-silent": isSilent,
      });

      notesMarkup += `<button class="${noteClasses}" style="transform: translateY(${yPos}px)" aria-label="${pitch}"></button>`;
    })

    return notesMarkup;
  }

  render() {
    // Prevent weird bugs by removing observers from any existing notes, before re-rendering.
    this.element.querySelectorAll('.hole').forEach(hole => playheadObserver.observer.unobserve(hole));

    this.element.innerHTML = `
      <div class="shadow-note ${this.lastShadowNoteVisibilityClass}" style="transform: translateY(${this.lastShadowNotePosition}px)"></div>
      ${this.renderNotes(this.props.id)}
    `;

    this.element.querySelectorAll('.hole').forEach(hole => playheadObserver.observeWithIntermission(hole));
    this.element.addEventListener('pointerenter', this.showShadowNote);
    this.element.addEventListener('mouseleave', this.hideShadowNote);
    this.element.addEventListener('mousemove', this.haveShadowNoteFollowCursor);
    this.element.addEventListener('click', this.handleClick);
  }
}

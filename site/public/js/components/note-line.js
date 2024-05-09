import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { playheadObserver } from '../common/playhead-observer.js';
import { sampler, isSamplerLoaded } from '../common/sampler.js';
import { forEachNotes, isNotePositionSilent } from '../common/silent-notes.js';
import { QUARTER_BAR_GAP, EIGHTH_BAR_GAP, SIXTEENTH_BAR_GAP, NOTE_LINE_STARTING_GAP, FOOTER_BUTTON_HEIGHT } from '../common/constants.js';

const DEFAULT_SHADOW_NOTE_POSITION = 8;

export class NoteLine extends MBComponent {
  constructor(props) {
    super({
      props,
      renderTrigger: `songState.songData.${props.id}`,
      element: document.getElementById(props.id)
    });

    // We need to bind these in order to use "this" inside of them.
    this.showShadowNote = this.showShadowNote.bind(this);
    this.haveShadowNoteFollowCursor = this.haveShadowNoteFollowCursor.bind(this);
    this.handleClick = this.handleClick.bind(this);

    // When a note is added or removed, the NoteLine is re-rendered underneath the cursor.
    // In this situation, the mouse events won't fire until you move the mouse again. This
    // led to some edge-cases where the shadow note wasn't being positioned properly during
    // repeated clicks. To fix this, we store the last shadow note position (and visibility)
    // details, so we can use them to set the initial shadow note position during re-renders.
    this.lastShadowNotePosition = DEFAULT_SHADOW_NOTE_POSITION;
    this.lastShadowNoteVisibilityClass = '';
  }

  getNoteLineLengthVar() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--default-note-line-length').trim());
  }

  showShadowNote(event) {
    const shadowNoteEl = event.currentTarget.querySelector('.shadow-note');

    this.lastShadowNoteVisibilityClass = 'shadow-note--visible';
    shadowNoteEl.classList.add('shadow-note--visible');

    this.positionShadowNote(shadowNoteEl, event.pageY);
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

    this.positionShadowNote(shadowNoteEl, event.pageY);
  }

  snapToInterval(relativeCursorYPos, INTERVAL) {
    if (!INTERVAL) return relativeCursorYPos;

    // I arrived at this formula through trial-and-error with Josiah, and it works!
    const snappedYPos = Math.round((relativeCursorYPos - NOTE_LINE_STARTING_GAP) / INTERVAL) * INTERVAL + NOTE_LINE_STARTING_GAP;

    // This prevents us from snapping notes to positions inside the starting gap.
    return snappedYPos < NOTE_LINE_STARTING_GAP ? NOTE_LINE_STARTING_GAP : snappedYPos;
  }

  positionShadowNote(shadowNoteEl, cursorPositionPageY) {
    // We're building the translateY value for the shadow note, but the web apis aren't ideal so we have to cobble it
    // together from the properties we have. For noteLinesPageOffsetTop, see https://stackoverflow.com/q/34422189/1154642
    const noteLinesPageOffsetTop = document.querySelector('#note-lines').getBoundingClientRect().top + window.scrollY;
    let relativeCursorYPos = cursorPositionPageY - noteLinesPageOffsetTop;

    // We define thresholds that shadow notes can't be placed above or below. This prevents
    // bugs like the hole getting cut off at the top or being placed below the footer button.
    const SHADOW_NOTE_STARTING_THRESHOLD = NOTE_LINE_STARTING_GAP / 2;
    const SHADOW_NOTE_ENDING_THRESHOLD = NOTE_LINE_STARTING_GAP + this.getNoteLineLengthVar() - FOOTER_BUTTON_HEIGHT;

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

    const snapToIntervals = {
      'none': 0,
      'grid': EIGHTH_BAR_GAP,
      '16ths': SIXTEENTH_BAR_GAP,
      '¼ triplet': (2 * QUARTER_BAR_GAP) / 3,
      '⅛ triplet': (2 * EIGHTH_BAR_GAP) / 3,
    };

    const currentSelectedInterval = snapToIntervals[musicBoxStore.state.appState.snapTo];
    const shadowNoteYPosition = this.snapToInterval(relativeCursorYPos, currentSelectedInterval);

    this.lastShadowNotePosition = shadowNoteYPosition;
    shadowNoteEl.style = `transform: translateY(${shadowNoteYPosition}px)`;
  }

  handleClick(event) {
    const noteLineEl = event.currentTarget;
    const shadowNoteEl = noteLineEl.querySelector('.shadow-note');
    const pitch = noteLineEl.id;

    const isShadowNoteOverlappingExistingNote = shadowNoteYPos => (
      musicBoxStore.state.songState.songData[pitch].includes(shadowNoteYPos)
    );

    const getNoteYPos = element => {
      const yposMatch = element.style.transform.match(/translateY\((\d+\.?\d*)px\)/); // https://regex101.com/r/49U5Dx/1
      return (yposMatch && yposMatch[1]) ? parseInt(yposMatch[1]) : console.error("Couldn't find note position");
    };

    const shadowNoteYPos = getNoteYPos(shadowNoteEl);

    if (event.target.classList.contains('hole')) {
      this.removeNote(pitch, getNoteYPos(event.target));
    }
    else if (isShadowNoteOverlappingExistingNote(shadowNoteYPos)) {
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
    let notesMarkup = '';

    forEachNotes(notesArray, (yPos, isSilent) => {
      notesMarkup += `<button class="hole ${isSilent ? 'silent' : ''}" style="transform: translateY(${yPos}px)" aria-label="${pitch}"></button>`;
    })

    return notesMarkup;
  }

  render() {
    // Prevent weird bugs by removing observers from any existing notes, before re-rendering.
    this.element.querySelectorAll('.hole').forEach(hole => playheadObserver.get().unobserve(hole));

    this.element.innerHTML = `
      <div class="shadow-note ${this.lastShadowNoteVisibilityClass}" style="transform: translateY(${this.lastShadowNotePosition}px)"></div>
      ${this.renderNotes(this.props.id)}
    `;

    this.element.querySelectorAll('.hole').forEach(hole => playheadObserver.get().observe(hole));
    this.element.addEventListener('mouseenter', this.showShadowNote);
    this.element.addEventListener('mouseleave', this.hideShadowNote);
    this.element.addEventListener('mousemove', this.haveShadowNoteFollowCursor);
    this.element.addEventListener('click', this.handleClick);
  }
}

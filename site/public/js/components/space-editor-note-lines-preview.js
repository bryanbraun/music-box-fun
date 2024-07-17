import { MBComponent } from '../music-box-component.js';
import { getCurrentPitchArray } from '../common/box-types.js';
import { forEachNotes } from '../common/notes.js';
import { FOOTER_BUTTON_HEIGHT, QUARTER_BAR_GAP, NUMBER_OF_BARS_PER_PAGE } from '../common/constants.js';

// This preview component is just a simple, non-interactive display of the paper. It has no
// event listeners or render trigger and it's elements are divs (instead of buttons). It is
// only rendered manually by the parent component.
export class SpaceEditorNoteLinesPreview extends MBComponent {
  constructor(props) {
    super({
      element: props.element
    });
  }

  renderNoteLine({ notesArray, noteStatusArray }) {
    let notesMarkup = '';

    forEachNotes(notesArray, (yPos, isSilent, i) => {
      if (noteStatusArray[i] === 'altered') {
        notesMarkup += `<div class="shadow-note shadow-note--visible" style="transform: translateY(${yPos}px)"></div>`;
      } else {
        notesMarkup += `<div class="hole ${isSilent ? 'silent' : ''}" style="transform: translateY(${yPos}px)"></div>`;
      }
    })

    return notesMarkup;
  }

  renderDividers() {
    const numberOfPages = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--number-of-bars').trim()) / NUMBER_OF_BARS_PER_PAGE;
    const numberOfDividers = numberOfPages - 1;

    if (numberOfDividers < 1) return '';

    let dividerMarkup = '';

    for (let i = 0; i < numberOfDividers; i++) {
      let yFromBottom = FOOTER_BUTTON_HEIGHT + ((numberOfDividers - i) * NUMBER_OF_BARS_PER_PAGE * QUARTER_BAR_GAP);
      dividerMarkup += `<div class="divider" style="transform: translateY(-${yFromBottom}px"></div>`;
    }

    return dividerMarkup;
  }

  // Methods used by the parent component.
  //
  // In React, we'd show/hide in JSX, but I don't want to rerender and interfere with an active
  // mouseover event, so we'll try this instead.
  show() {
    this.element.style.display = 'block';
  }
  hide() {
    this.element.style.display = 'none';
  }

  render({ songData, noteStatuses }) {
    console.log('Preview rendered');

    const pitchArray = getCurrentPitchArray(); // @todo: possibly do this only on component instantiation for performance?

    this.element.innerHTML = `
      <div class="note-lines">
        ${pitchArray.map(pitchId => (
          `<div class="note-line">${this.renderNoteLine({ notesArray: songData[pitchId], noteStatusArray: noteStatuses[pitchId] })}</div>`
        )).join('')}
      </div>
      ${this.renderDividers()}
      <div class="extend-song-button">
        +
      </button>
    `;
  }
}

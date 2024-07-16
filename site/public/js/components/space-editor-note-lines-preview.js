import { MBComponent } from '../music-box-component.js';
import { getCurrentPitchArray } from '../common/box-types.js';
import { forEachNotes } from '../common/silent-notes.js';
import { musicBoxStore } from '../music-box-store.js';

export function transformSongData(dragStartYPos, draggedDistance) {
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


// This preview component is just a simple, non-interactive display of the paper. It has no
// event listeners or render trigger. It is only rendered manually by the parent component.
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
    `;
  }
}

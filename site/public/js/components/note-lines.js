import { MBComponent } from '../music-box-component.js';
import { NoteLine } from './note-line.js';
import { getCurrentPitchArray } from '../common/box-types.js';
import { forEachNotes } from '../common/notes.js';
import { musicBoxStore } from '../music-box-store.js';

// NoteLines supports default rendering for the standard note lines (via state)
// and alternative rendering for the space-editor's preview lines (via subscribe).
export class NoteLines extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#note-lines'),
      renderTrigger: 'songState.songData'
    });

    musicBoxStore.subscribe('SpaceEditorPreview', (previewProps) => this.renderSpaceEditorPreview(previewProps));
  }

  renderSpaceEditorPreview(previewProps) {
    // If we're missing preview data, fall back to rendering the real note lines.
    // We sometimes trigger this intentionally to force-clear the preview lines.
    if (!previewProps) {
      this.render();
      return;
    }

    const { previewSongData, noteStatuses } = previewProps;
    const pitchArray = getCurrentPitchArray();
    let previewMarkup = '';

    pitchArray.forEach(pitchId => {
      previewMarkup += `<div class="note-line" id="${pitchId}">`;

      forEachNotes(previewSongData[pitchId], (yPos, isSilent, i) => {
        if (noteStatuses[pitchId][i] === 'altered') {
          previewMarkup += `<div class="shadow-note shadow-note--visible" style="transform: translateY(${yPos}px)"></div>`;
        } else {
          previewMarkup += `<div class="hole ${isSilent ? 'silent' : ''}" style="transform: translateY(${yPos}px)"></div>`;
        }
      });

      previewMarkup += '</div>';
    });

    this.element.innerHTML = previewMarkup;
  }

  render() {
    // We use this method (instead of iterating over songData directly)
    // to ensure that the order of the pitches is what we expect.
    const pitchArray = getCurrentPitchArray();

    this.element.innerHTML = `
      ${pitchArray.map(pitchId => (
      `<div class="note-line" id="${pitchId}"></div>`
    )).join('')}
    `;

    this.element.addEventListener('pointerover', (event) => {
      if (event.pointerType === 'mouse') {
        musicBoxStore.setState('appState.highlightedPitch', event.target.id);
      }
    });
    this.element.addEventListener('pointerout', () => {
      musicBoxStore.setState('appState.highlightedPitch', null);
    })

    // Attach the new NoteLine components to the markup we just added.
    pitchArray.forEach(id => {
      new NoteLine({ id }).render();
    });
  }
}

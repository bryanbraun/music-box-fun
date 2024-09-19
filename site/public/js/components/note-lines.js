import { MBComponent } from './music-box-component.js';
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

  highlightPitch(event) {
    if (event.pointerType === 'mouse') {
      musicBoxStore.setState('appState.highlightedPitch', event.target.id);
    }
  }

  unhighlightPitch() {
    musicBoxStore.setState('appState.highlightedPitch', null);
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
        const silentClass = isSilent ? 'is-silent' : '';
        switch (noteStatuses[pitchId][i]) {
          case 'altered':
            previewMarkup += `<div class="shadow-note is-visible ${silentClass}" style="transform: translateY(${yPos}px)"></div>`;
            break;
          case 'altered_selected':
            previewMarkup += `<div class="shadow-note is-visible is-selected ${silentClass}" style="transform: translateY(${yPos}px)"></div>`;
            break;
          default:
            previewMarkup += `<div class="hole ${silentClass}" style="transform: translateY(${yPos}px)"></div>`;
            break;
        }
      });

      previewMarkup += '</div>';
    });

    this.element.innerHTML = previewMarkup;
  }

  render() {
    const pitchArray = getCurrentPitchArray();

    this.element.innerHTML = `
      ${pitchArray.map(pitchId => (
      `<div class="note-line" id="${pitchId}"></div>`
    )).join('')}
    `;

    this.element.addEventListener('pointerover', this.highlightPitch);
    this.element.addEventListener('pointerout', this.unhighlightPitch)

    // Attach the new NoteLine components to the markup we just added.
    pitchArray.forEach(id => {
      new NoteLine({ id }).render();
    });
  }
}

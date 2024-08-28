import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { boxTypePitches, boxTypeTitles, getCurrentBoxType } from '../common/box-types.js';
import { confirmationDialog } from '../common/confirmation-dialog.js';

export class MusicBoxTypeSelect extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState.songData',
      element: document.querySelector('#music-box-type')
    });

    // We need to bind these in order to use "this" inside of them.
    this.handleChange = this.handleChange.bind(this);
    this.isDataLoss = this.isDataLoss.bind(this);

    // We cache the last selected option, so we can revert to it if the user cancels switching.
    this.lastSelectedOption = undefined;
  }

  isDataLoss(currentBoxType, newBoxType) {
    const pitchesBeingRemoved = boxTypePitches[currentBoxType].filter((el) => {
      return !boxTypePitches[newBoxType].includes(el);
    }, this);

    const isRemovingPitchesWithNotes = pitchesBeingRemoved.some((el) => {
      return musicBoxStore.state.songState.songData[el].length !== 0;
    });

    return isRemovingPitchesWithNotes;
  }

  // Build the new song data by copying over the note arrays for all the pitches we are
  // interested in. If the existing box didn't have a pitch, we copy over an empty array.
  buildNewSongData(newBoxType) {
    let newSongData = {};
    boxTypePitches[newBoxType].forEach(function (el) {
      newSongData[el] = Array.from(musicBoxStore.state.songState.songData[el] || []);
    });
    return newSongData;
  }

  async handleChange(event) {
    const currentBoxType = getCurrentBoxType();
    const newBoxType = event.target.value;

    if (this.isDataLoss(currentBoxType, newBoxType)) {
      try {
        await confirmationDialog('Switching to this music box will delete some of your existing notes. \nAre you sure you want to continue?');
      } catch (error) {
        this.element.querySelector('select').value = this.lastSelectedOption;
        return;
      }
    }

    const newSongData = this.buildNewSongData(newBoxType);
    musicBoxStore.setState('songState.songData', newSongData);

    this.lastSelectedOption = newBoxType;
  }

  render() {
    const currentBoxType = getCurrentBoxType();

    this.lastSelectedOption = currentBoxType;

    this.element.innerHTML = `
      <label>
        <span class="visuallyhidden">Music Box Type</span>
        <select class="select select-music-box-type" data-testid="music-box-type-select" name="select-box-type">
          ${Object.entries(boxTypeTitles).map(([type, title]) => (
      `<option ${currentBoxType === type ? 'selected' : ''} value="${type}">${title}</option>`
    )).join('')}
        </select>
      </label>
    `;

    this.element.querySelector('select').addEventListener('change', this.handleChange);
  }
}

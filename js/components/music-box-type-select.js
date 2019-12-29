import { Component } from './component.js';
import { musicBoxStore } from '../music-box-store.js';
import { confirmationDialog } from '../services/confirmation-dialog.js';

export class MusicBoxTypeSelect extends Component {
  constructor() {
    super({
      element: document.querySelector('#music-box-type')
    });

    this.boxTypes = {
      '15': ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5','B5','C6'],
      '20': ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5','B5','C6','D6','E6','F6','G6','A6']
    }

    // We need to bind these in order to use "this" inside of them.
    this.getCurrentBoxType = this.getCurrentBoxType.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.isDataLoss = this.isDataLoss.bind(this);

    // We cache the last selected option, so we can revert to it if the user cancels switching.
    this.lastSelectedOption = undefined;
  }

  getCurrentBoxType() {
    const songDataPitches = Object.keys(musicBoxStore.state.songState.songData);
    const boxTypesKeys = Object.keys(this.boxTypes);
    let currentBoxType = '';

    for (var i = 0; i < boxTypesKeys.length; i++) {
      const boxTypePitches = this.boxTypes[boxTypesKeys[i]].concat(); // Use concat to create a copy

      if (songDataPitches.sort().join(',') === boxTypePitches.sort().join(',')) {
        currentBoxType = boxTypesKeys[i];
        break;
      }
    }

    if (!currentBoxType) {
      throw Error('The current Music Box Type could not be identified.');
    }

    return currentBoxType;
  }

  isDataLoss(currentBoxType, newBoxType) {
    const isRemovingPitches = this.boxTypes[newBoxType].length < this.boxTypes[currentBoxType].length;
    if (isRemovingPitches) {
      const pitchesBeingRemoved = this.boxTypes[currentBoxType].filter(function(el) {
        return !this.boxTypes[newBoxType].includes(el);
      }, this);

      const isRemovingPitchesWithNotes = pitchesBeingRemoved.some(function(el) {
        return musicBoxStore.state.songState.songData[el].length !== 0;
      });

      return isRemovingPitchesWithNotes;
    }

    return false;
  }

  // Build the new song data by copying over the note arrays for all the pitches we are
  // interested in. If the existing box didn't have a pitch, we copy over an empty array.
  buildNewSongData(newBoxType) {
    let newSongData = {};
    this.boxTypes[newBoxType].forEach(function(el) {
      newSongData[el] = Array.from(musicBoxStore.state.songState.songData[el] || []);
    });
    return newSongData;
  }

  setNumberOfNotesVar(numberOfNotes) {
    document.documentElement.style.setProperty('--number-of-notes', numberOfNotes);
  }

  async handleChange(event) {
    const currentBoxType = this.getCurrentBoxType();
    const newBoxType = event.target.value;

    if (this.isDataLoss(currentBoxType, newBoxType)) {
      try {
        await confirmationDialog("Switching to this music box will delete some of your existing notes. \nAre you sure you want to continue?");
      } catch (error) {
        this.element.querySelector('select').value = this.lastSelectedOption;
        return;
      }
    }

    const newSongData = this.buildNewSongData(newBoxType);
    musicBoxStore.setState('songState.songData', newSongData);

    // Publish a custom event for our box to re-render from. We can't subscribe to 'songState.songData',
    // because it would re-render anytime any songData changes (like when a note is added/removed). This
    // wouldn't be an issue if we stored the box-type in state (and subscribed to it). Instead, we're
    // inferring the box type from the existence of pitches in the data, which makes this a little more
    // challenging but has other benefits.
    musicBoxStore.publish('boxType', newSongData);

    this.lastSelectedOption = newBoxType;
    this.setNumberOfNotesVar(newBoxType);
  }

  render() {
    const currentBoxType = this.getCurrentBoxType();
    const selected15 = currentBoxType === '15' ? 'selected=""' : '';
    const selected20 = currentBoxType === '20' ? 'selected=""' : '';

    // Set values for the initial page load.
    this.lastSelectedOption = currentBoxType;
    this.setNumberOfNotesVar(currentBoxType);

    this.element.innerHTML = `
      <select class="select select-music-box-type">
        <option ${selected15} value="15">15-note</option>
        <option ${selected20} value="20">20-note</option>
      </select>
    `;

    this.element.querySelector('select').addEventListener('change', this.handleChange);
  }
}

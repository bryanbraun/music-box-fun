import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';
import { boxTypePitches, boxTypeHoleWidths, getCurrentBoxType } from '../common/box-types.js';
import { confirmationDialog } from '../common/confirmation-dialog.js';

export class MusicBoxTypeSelect extends Component {
  constructor(props) {
    super({
      props,
      element: document.querySelector('#music-box-type')
    });

    // We need to bind these in order to use "this" inside of them.
    this.handleChange = this.handleChange.bind(this);
    this.isDataLoss = this.isDataLoss.bind(this);

    // We cache the last selected option, so we can revert to it if the user cancels switching.
    this.lastSelectedOption = undefined;
  }

  isDataLoss(currentBoxType, newBoxType) {
    const isRemovingPitches = boxTypePitches[newBoxType].length < boxTypePitches[currentBoxType].length;
    if (isRemovingPitches) {
      const pitchesBeingRemoved = boxTypePitches[currentBoxType].filter(function(el) {
        return !boxTypePitches[newBoxType].includes(el);
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
    boxTypePitches[newBoxType].forEach(function(el) {
      newSongData[el] = Array.from(musicBoxStore.state.songState.songData[el] || []);
    });
    return newSongData;
  }

  setNumberOfNotesVar(numberOfNotes) {
    document.documentElement.style.setProperty('--number-of-notes', numberOfNotes);
  }

  setHoleWidthVar(boxType) {
    document.documentElement.style.setProperty('--hole-width', boxTypeHoleWidths[boxType]);
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
    this.setNumberOfNotesVar(newBoxType);
    this.setHoleWidthVar(newBoxType);

    // Publish a custom event for our box to re-render from. We can't subscribe to 'songState.songData',
    // because it would re-render anytime any songData changes (like when a note is added/removed). This
    // wouldn't be an issue if we stored the box-type in state (and subscribed to it). Instead, we're
    // inferring the box type from the existence of pitches in the data, which makes this a little more
    // challenging but has other benefits.
    musicBoxStore.publish('boxType', newSongData);
  }

  render() {
    const currentBoxType = this.props.currentBoxType || getCurrentBoxType();
    const selected15 = currentBoxType === '15' ? 'selected=""' : '';
    const selected20 = currentBoxType === '20' ? 'selected=""' : '';
    const selected30 = currentBoxType === '30' ? 'selected=""' : '';

    this.lastSelectedOption = currentBoxType;

    this.element.innerHTML = `
      <select class="select select-music-box-type">
        <option ${selected15} value="15">15-note</option>
        <option ${selected20} value="20">20-note</option>
        <option ${selected30} value="30">30-note</option>
      </select>
    `;

    this.element.querySelector('select').addEventListener('change', this.handleChange);
  }
}

import { Component } from './component.js';
import { PaperDivider } from './paper-divider.js';
import { musicBoxStore } from '../music-box-store.js';

export class PaperFooter extends Component {
  constructor(props) {
    super({
      renderTrigger: 'songState.songData',
      element: document.querySelector('#paper-footer')
    });

    this.isInitialRender = true;

    // Constants
    this.NUMBER_OF_BARS = 52;
    this.BAR_LENGTH = 50;
    this.STARTING_GAP = 16; // hole size
    this.ENDING_GAP = 48;
    this.FINAL_BAR_LINE = 1;

    // Bindings
    this.setInitialMusicLength = this.setInitialMusicLength.bind(this);
    this.extendSong = this.extendSong.bind(this);
    this.trimSong = this.trimSong.bind(this);
  }

  getMusicLengthVar() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--default-music-length').trim());
  }

  setMusicLengthVar(newVal) {
    document.documentElement.style.setProperty('--default-music-length', `${newVal}px`);
  }

  getNumberOfUsedPages() {
    const singleUsePixels = (this.STARTING_GAP / 2) + this.FINAL_BAR_LINE; // 9
    const pageDivisor = this.NUMBER_OF_BARS * this.BAR_LENGTH; // 2600

    const finalNoteYPos = Object.values(musicBoxStore.state.songState.songData).reduce((accumulator, currentValue) => {
      return Math.max(accumulator, Math.max(...currentValue));
    }, 0);

    return Math.ceil((finalNoteYPos - singleUsePixels) / pageDivisor) || 1;
  }

  getNumberOfExposedPages() {
    const singleUsePixels = this.STARTING_GAP + this.ENDING_GAP + this.FINAL_BAR_LINE; // 65
    const pageDivisor = this.NUMBER_OF_BARS * this.BAR_LENGTH; // 2600
    return (this.getMusicLengthVar() - singleUsePixels) / pageDivisor;
  }

  setInitialMusicLength() {
    const initialMusicLength = this.STARTING_GAP + (this.NUMBER_OF_BARS * this.BAR_LENGTH * this.getNumberOfUsedPages()) + this.ENDING_GAP + this.FINAL_BAR_LINE;

    this.setMusicLengthVar(initialMusicLength);
  }

  extendSong() {
    const newMusicLength = this.getMusicLengthVar() + (this.NUMBER_OF_BARS * this.BAR_LENGTH);
    this.setMusicLengthVar(newMusicLength);
    this.render();
  }

  trimSong(event) {
    const newMusicLength = this.getMusicLengthVar() - (this.NUMBER_OF_BARS * this.BAR_LENGTH);
    this.setMusicLengthVar(newMusicLength);
    this.render();
  }

  render() {
    // A little hack for setting the initial minimum music length on page load.
    if (this.isInitialRender) {
      this.setInitialMusicLength();
      this.isInitialRender = false;
    }

    const numberOfDividers = this.getNumberOfExposedPages() - 1;

    this.element.innerHTML = `
      <div id="dividers">
        ${Array(numberOfDividers).fill()
          .map((val, index) => `<div id="divider-${index + 1}" class="divider"></div>`)
          .join('')}
      </div>
      <button class="extend-song-button" title="Extend Song"">
        <span class="dashed-line"></span>
        +
      </button>
    `;

    for (var i = 0; i < numberOfDividers; i++) {
      new PaperDivider({
        dividerNumber: i + 1,
        isTrimmable: this.getNumberOfUsedPages() <= (i + 1),
        yFromBottom: this.ENDING_GAP + ((numberOfDividers - i) * this.NUMBER_OF_BARS * this.BAR_LENGTH),
        trimSong: this.trimSong
      }).render();
    }

    this.element.querySelector('.extend-song-button').addEventListener('click', this.extendSong);
  }
}

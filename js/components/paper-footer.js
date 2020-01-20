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
    this.ENDING_GAP = 48;
    this.FINAL_BAR_LINE = 1;

    // Bindings
    this.setInitialMusicLength = this.setInitialMusicLength.bind(this);
    this.extendSong = this.extendSong.bind(this);
    this.trimSong = this.trimSong.bind(this);
  }

  getNoteLineLengthVar() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--default-note-line-length').trim());
  }

  getHoleWidthVar() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hole-width').trim());
  }

  setNoteLineLengthVar(newVal) {
    document.documentElement.style.setProperty('--default-note-line-length', `${newVal}px`);
  }

  getNumberOfUsedPages() {
    // We use "standard" values instead of dynamic ones for the hole size because these
    // calculations are made against stored note data, which isn't adjusted for hole size.
    const STANDARD_STARTING_GAP = 16;
    const STANDARD_HALF_HOLE = 8;
    const singleUsePixels = STANDARD_STARTING_GAP - STANDARD_HALF_HOLE + this.FINAL_BAR_LINE; // 25
    const pageDivisor = this.NUMBER_OF_BARS * this.BAR_LENGTH; // 2600

    const finalNoteYPos = Object.values(musicBoxStore.state.songState.songData).reduce((accumulator, currentValue) => {
      return Math.max(accumulator, Math.max(...currentValue));
    }, 0);

    return Math.ceil((finalNoteYPos - singleUsePixels) / pageDivisor) || 1;
  }

  getNumberOfExposedPages() {
    const singleUsePixels = this.ENDING_GAP + this.FINAL_BAR_LINE; // 49
    const pageDivisor = this.NUMBER_OF_BARS * this.BAR_LENGTH; // 2600
    return (this.getNoteLineLengthVar() - singleUsePixels) / pageDivisor;
  }

  setInitialMusicLength() {
    const initialNoteLineLength = (this.NUMBER_OF_BARS * this.BAR_LENGTH * this.getNumberOfUsedPages()) + this.ENDING_GAP + this.FINAL_BAR_LINE;
    this.setNoteLineLengthVar(initialNoteLineLength);
  }

  extendSong() {
    const newNoteLineLength = this.getNoteLineLengthVar() + (this.NUMBER_OF_BARS * this.BAR_LENGTH);
    this.setNoteLineLengthVar(newNoteLineLength);
    this.render();
  }

  trimSong(event) {
    const newNoteLineLength = this.getNoteLineLengthVar() - (this.NUMBER_OF_BARS * this.BAR_LENGTH);
    this.setNoteLineLengthVar(newNoteLineLength);
    this.render();
  }

  render() {
    // A little hack for setting the initial minimum music length on page load. Maybe
    // someday we can find a clean way to add this to the "Initialize values" in main.js.
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

import { MBComponent } from '../music-box-component.js';
import { PaperDivider } from './paper-divider.js';
import { musicBoxStore } from '../music-box-store.js';
import { QUARTER_BAR_GAP, STANDARD_HOLE_RADIUS } from '../common/constants.js';

export class PaperFooter extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState.songData*',
      element: document.querySelector('#paper-footer')
    });

    musicBoxStore.subscribe('songState.songData', () => this.render(true)); // see render() for why we subscribe to this separately.

    // Constants
    this.NUMBER_OF_BARS = 52;
    this.ENDING_GAP = 48;
    this.FINAL_BAR_LINE = 1;

    // Bindings
    this.getNoteLineLengthFromSongData = this.getNoteLineLengthFromSongData.bind(this);
    this.extendSongPaper = this.extendSongPaper.bind(this);
    this.trimSongPaper = this.trimSongPaper.bind(this);
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
    const singleUsePixels = STANDARD_STARTING_GAP - STANDARD_HOLE_RADIUS + this.FINAL_BAR_LINE;
    const pageDivisor = this.NUMBER_OF_BARS * QUARTER_BAR_GAP; // 2496

    const finalNoteYPos = Object.values(musicBoxStore.state.songState.songData).reduce((accumulator, currentValue) => {
      return Math.max(accumulator, Math.max(...currentValue));
    }, 0);

    return Math.ceil((finalNoteYPos - singleUsePixels) / pageDivisor) || 1;
  }

  getNumberOfExposedPages() {
    const singleUsePixels = this.ENDING_GAP + this.FINAL_BAR_LINE; // 49
    const pageDivisor = this.NUMBER_OF_BARS * QUARTER_BAR_GAP; // 2496
    return (this.getNoteLineLengthVar() - singleUsePixels) / pageDivisor;
  }

  getNoteLineLengthFromSongData() {
    return (this.NUMBER_OF_BARS * QUARTER_BAR_GAP * this.getNumberOfUsedPages()) + this.ENDING_GAP + this.FINAL_BAR_LINE;
  }

  extendSongPaper() {
    const newNoteLineLength = this.getNoteLineLengthVar() + (this.NUMBER_OF_BARS * QUARTER_BAR_GAP);
    this.render(true, newNoteLineLength);
  }

  trimSongPaper(event) {
    const newNoteLineLength = this.getNoteLineLengthVar() - (this.NUMBER_OF_BARS * QUARTER_BAR_GAP);
    this.render(true, newNoteLineLength);
  }

  /*
      There are five cases for rendering this component:

      CASE                                  TRIGGER                        LINE LENGTH CHANGE
      1. Initial song load                  manual (from main.js)          Yes - Calculate from songData
      2. Subsequent song load (link click)  songState.songData             Yes - Calculate from songData
      3. Extend song                        manual (from extendSongPaper)  Yes - Fixed length change
      4. Trim song                          manual (from trimSongPaper)    Yes - Fixed length change
      5. Note change (for the divider "×")  songState.songData*            No  - No changes needed

      By giving params to our render function and manually passing values into render() for
      cases 1, 2, 3, and 4, we can render the LINE LENGTH appropriately in all 5 cases.
  */
  render(isUpdatingLineLength, newNoteLineLength) {
    if (isUpdatingLineLength) {
      this.setNoteLineLengthVar(newNoteLineLength || this.getNoteLineLengthFromSongData());
    }

    const numberOfDividers = this.getNumberOfExposedPages() - 1;

    this.element.innerHTML = `
      <div id="dividers" class="dividers">
        ${Array(numberOfDividers).fill()
          .map((val, index) => `<div id="divider-${index + 1}" class="divider" data-testid="divider"></div>`)
          .join('')}
      </div>
      <button class="extend-song-button" title="Extend Song" data-testid="extend">
        <span class="dashed-line"></span>
        +
      </button>
    `;

    for (var i = 0; i < numberOfDividers; i++) {
      new PaperDivider({
        dividerNumber: i + 1,
        isTrimmable: this.getNumberOfUsedPages() <= (i + 1),
        yFromBottom: this.ENDING_GAP + ((numberOfDividers - i) * this.NUMBER_OF_BARS * QUARTER_BAR_GAP),
        trimSongPaper: this.trimSongPaper
      }).render();
    }

    this.element.querySelector('.extend-song-button').addEventListener('click', this.extendSongPaper);
  }
}

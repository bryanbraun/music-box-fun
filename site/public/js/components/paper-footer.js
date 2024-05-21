import { MBComponent } from '../music-box-component.js';
import { PaperDivider } from './paper-divider.js';
import { musicBoxStore } from '../music-box-store.js';
import { QUARTER_BAR_GAP, NOTE_LINE_STARTING_GAP, FOOTER_BUTTON_HEIGHT, FINAL_BAR_LINE } from '../common/constants.js';

export class PaperFooter extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState.songData*',
      element: document.querySelector('#paper-footer')
    });

    musicBoxStore.subscribe('songState.songData', () => this.render(true)); // see render() for why we subscribe to this separately.

    // Other Constants
    this.NUMBER_OF_BARS_PER_PAGE = 52;
    this.PAGE_DIVISOR = this.NUMBER_OF_BARS_PER_PAGE * QUARTER_BAR_GAP; // 2496

    // Bindings
    this.extendSongPaper = this.extendSongPaper.bind(this);
    this.trimSongPaper = this.trimSongPaper.bind(this);
  }

  getNoteLineHeight() {
    return parseInt(getComputedStyle(document.querySelector('#note-lines')).getPropertyValue('height').trim());
  }

  setNumberOfPages(numberOfPages) {
    document.documentElement.style.setProperty('--number-of-bars', numberOfPages * this.NUMBER_OF_BARS_PER_PAGE);
  }

  getNumberOfPagesFromSongData() {
    const finalNoteYPos = Object.values(musicBoxStore.state.songState.songData).reduce((accumulator, currentValue) => {
      return Math.max(accumulator, Math.max(...currentValue));
    }, 0);

    return Math.ceil((finalNoteYPos - NOTE_LINE_STARTING_GAP) / this.PAGE_DIVISOR) || 1;
  }

  // This can include completely blank pages added by the user.
  getNumberOfExposedPages() {
    const singleUsePixels = NOTE_LINE_STARTING_GAP + FINAL_BAR_LINE + FOOTER_BUTTON_HEIGHT; // 65
    return (this.getNoteLineHeight() - singleUsePixels) / this.PAGE_DIVISOR;
  }

  extendSongPaper() {
    this.render(true, this.getNumberOfExposedPages() + 1);
  }

  trimSongPaper() {
    this.render(true, this.getNumberOfExposedPages() - 1);
  }

  /*
      There are five cases for rendering this component:

      CASE                                  TRIGGER                        PAGE NUMBER CHANGE
      1. Initial song load                  manual (from main.js)          Yes - Calculate from songData
      2. Subsequent song load (link click)  songState.songData             Yes - Calculate from songData
      3. Extend song                        manual (from extendSongPaper)  Yes - Fixed length change
      4. Trim song                          manual (from trimSongPaper)    Yes - Fixed length change
      5. Note change (for the divider "×")  songState.songData*            No  - No changes needed

      By giving params to our render function and manually passing values into render() for
      cases 1, 2, 3, and 4, we can render the PAGE NUMBER appropriately in all 5 cases.
  */
  render(isUpdatingPageCount, newNumberOfPages) {
    if (isUpdatingPageCount) {
      this.setNumberOfPages(newNumberOfPages || this.getNumberOfPagesFromSongData());
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

    for (let i = 0; i < numberOfDividers; i++) {
      new PaperDivider({
        dividerNumber: i + 1,
        isTrimmable: this.getNumberOfPagesFromSongData() <= (i + 1),
        yFromBottom: FOOTER_BUTTON_HEIGHT + ((numberOfDividers - i) * this.NUMBER_OF_BARS_PER_PAGE * QUARTER_BAR_GAP),
        trimSongPaper: this.trimSongPaper
      }).render();
    }

    this.element.querySelector('.extend-song-button').addEventListener('click', this.extendSongPaper);
  }
}

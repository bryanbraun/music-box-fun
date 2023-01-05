import { MBComponent } from '../music-box-component.js';
import { getCurrentBoxType } from '../common/box-types.js';

export class Description extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState.songData',
      element: document.querySelector('#description')
    });

    this.boxLinks = {
      '15': 'https://amzn.to/3jPCAMG',
      '20': 'https://www.grand-illusions.com/20-note-music-box-set-c2x21140292',
      '30': 'https://amzn.com/dp/B0774TSP3T/'
    };
  }

  render() {
    const currentBoxType = getCurrentBoxType();
    this.element.innerHTML = `
      <p>This is a ${currentBoxType}-note <a href="/guides/diy-music-box">DIY music box</a>, that works just like
        <a href="${this.boxLinks[currentBoxType]}" target="_blank" rel="noopener noreferrer">the mechanical ones</a>.
      </p>
    `;
  }
}

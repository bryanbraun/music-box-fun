import { MBComponent } from './music-box-component.js';
import { getCurrentBoxType, boxTypeTitles, boxTypeLinks } from '../common/box-types.js';

export class Description extends MBComponent {
  constructor() {
    super({
      renderTrigger: 'songState.songData',
      element: document.querySelector('#description')
    });
  }

  render() {
    const currentBoxType = getCurrentBoxType();
    this.element.innerHTML = `
      <p>This is a ${boxTypeTitles[currentBoxType]} <a href="/guides/diy-music-box">DIY music box</a>, that works just like
        <a href="${boxTypeLinks[currentBoxType]}" target="_blank" rel="noopener noreferrer">the mechanical ones</a>.
      </p>
    `;
  }
}

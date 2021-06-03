import { Component } from '../alt-react/component.js';
import { getCurrentBoxType } from '../common/box-types.js';

export class Description extends Component {
  constructor() {
    super({
      renderTrigger: 'songState.songData',
      element: document.querySelector('#description')
    });

    this.boxLinks = {
      '15': 'https://www.amazon.com/dp/B000HAUEFY/ref=psdc_3291682011_t1_B019Z6AJP0?th=1',
      '20': 'https://www.grand-illusions.com/20-note-music-box-set-c2x21140292',
      '30': 'https://www.amazon.com/Movement-Refill-Strips-Puncher-Customize/dp/B019Z6AJP0/ref=pd_sbs_201_5/147-2607630-6675016'
    };
  }

  render() {
    const currentBoxType = getCurrentBoxType();
    this.element.innerHTML = `
      <p>This is a ${currentBoxType}-note DIY music box, that works just like
        <a href="${this.boxLinks[currentBoxType]}" target="_blank" rel="noopener noreferrer" >the mechanical ones</a>.
      </p>
    `;
  }
}

import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import classNames from '../vendor/classnames.js';

export class PaperDivider extends MBComponent {
  constructor(props) {
    super({
      props,
      element: document.querySelector(`#divider-${props.dividerNumber}`)
    });
  }

  render() {
    const classes = classNames(
      'divider__trim-icon', {
      'divider__trim-icon--hidden': !this.props.isTrimmable
    });

    this.element.style.transform = `translateY(-${this.props.yFromBottom}px)`;
    this.element.innerHTML = `
      <button class="${classes}">
        <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd" stroke-linecap="square" stroke="#979797">
            <path d="M1 1l8 8M9 1L1 9"/>
          </g>
        </svg>
      </button>
    `;

    this.element.querySelector('.divider__trim-icon').addEventListener('click', this.props.trimSongPaper);
  }
}

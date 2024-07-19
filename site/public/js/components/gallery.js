import { lory } from '../vendor/loryjs.js';
import { BaseComponent } from '../alt-react/base-component.js';

export class Gallery extends BaseComponent {
  constructor(props) {
    super({
      props,
      element: document.getElementById(props.id)
    });

    this.lorySlider = null;
    this.handleDotClick = this.handleDotClick.bind(this);
    this.updateDots = this.updateDots.bind(this);
    this.renderDots = this.renderDots.bind(this);
  }

  handleDotClick(event) {
    this.lorySlider.slideTo(Number(event.target.textContent));
  }

  updateDots(event) {
    const updatedDotsMarkup = this.renderDots({ activeSlide: event.detail.currentSlide});

    this.element.querySelector('.slider_dots').outerHTML = updatedDotsMarkup;
    this.element.querySelectorAll('.slider_dot').forEach(dot => {
      dot.addEventListener('click', this.handleDotClick);
    });
  }

  renderDots({ activeSlide }) {
    return `
      <ul class="slider_dots">
        ${this.props.images.map((_, index) => (
          `<li class="${activeSlide === index ? 'active' : ''}">
            <button class="slider_dot">${index}</button>
          </li>`
        )).join('')}
      </ul>
    `;
  }

  // We only render the gallery once because lory.js manages most of it's internal
  // state. The only exception is the active indicator on the pagination dots, so
  // we break convention to update that specific thing outside of the render-cycle.
  render() {
    this.element.innerHTML = `
      <div class="slider js_slider gallery-label">
        <div class="frame js_frame">
          <ul class="slides js_slides">
            ${this.props.images.map(image => (
              `<li class="js_slide"><img src="${image.src}" alt="${image.alt}" loading="lazy" /></li>`
            )).join('')}
          </ul>
        </div>
        <button class="js_prev prev">
          <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby="prev-svg-title" width="50" height="50" viewBox="0 0 501.5 501.5">
            <title id="prev-svg-title">Previous Slide</title>
            <g>
              <path fill="#FFFFFF" stroke="#222222" stroke-width="8" d="M302.67 90.877l55.77 55.508L254.575 250.75 358.44 355.116l-55.77 55.506L143.56 250.75z" />
            </g>
          </svg>
        </button>
        <button class="js_next next">
          <svg xmlns="http://www.w3.org/2000/svg" aria-labelledby="next-svg-title" width="50" height="50" viewBox="0 0 501.5 501.5">
            <title id="next-svg-title">Next Slide</title>
            <g>
              <path fill="#FFFFFF" stroke="#222222" stroke-width="8" d="M199.33 410.622l-55.77-55.508L247.425 250.75 143.56 146.384l55.77-55.507L358.44 250.75z" />
            </g>
          </svg>
        </button>
        ${this.renderDots({ activeSlide: 0 })}
      </div>
    `;

    this.lorySlider = lory(this.element, { rewind: true });

    this.element.addEventListener('after.lory.slide', this.updateDots);
    this.element.querySelectorAll('.slider_dot').forEach(dot => {
      dot.addEventListener('click', this.handleDotClick);
    });
  }
}

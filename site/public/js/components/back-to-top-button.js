import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';

export class BackToTopButton extends MBComponent {
  constructor() {
    super({
      element: document.getElementById('back-to-top')
    });

    this.createObservedElement = this.createObservedElement.bind(this);
    this.destroyObservedElement = this.destroyObservedElement.bind(this);

    this.backToTopObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const buttonEl = this.element.querySelector('.back-to-top-button');
        if (entry.isIntersecting) {
          buttonEl.classList.add('is-transitioning');
          buttonEl.classList.add('is-hidden');
        } else {
          buttonEl.classList.add('is-transitioning');

          // Force layout to ensure the new display: block and opacity: 0
          // values are taken into account when the CSS transition starts.
          // Doing this fixes a one-way transition bug in firefox.
          buttonEl.clientWidth;
          buttonEl.classList.remove('is-hidden');
        }
      })
    });
  }

  handleClick() {
    if (musicBoxStore.state.appState.isPlaying) {
      musicBoxStore.setState('appState.isPlaying', false);
      // This timeout gives the page-scroller's requestAnimationFrame enough time
      // to see the new isPlaying value and stop scrolling, so our scrollTo will work.
      // If we ever move away from requestAnimationFrame for scrolling we may be able
      // to remove this.
      setTimeout(() => window.scrollTo(0, 0), 50);
    } else {
      window.scrollTo(0, 0);
    }
  }

  removeTransitioningClass(event) {
    // Ensure that we only do this once per transitionend. See:
    // https://seesparkbox.com/foundry/css_transitionend_event
    if (event.propertyName === 'opacity') {
      event.currentTarget.classList.remove('is-transitioning');
    }
  }

  // It's annoying but I need to place the observed element outside of this component
  // in order for it to scroll off the page (since the BackToTopButton component is being
  // rendered inside of a fixed container).
  createObservedElement(elementId) {
    const observedEl = document.createElement('div');

    observedEl.id = elementId;
    observedEl.className = elementId;
    document.body.appendChild(observedEl);

    this.backToTopObserver.observe(observedEl);
  }

  destroyObservedElement(elementId) {
    const observedEl = document.getElementById(elementId);

    if (!observedEl) return;

    this.backToTopObserver.unobserve(observedEl)

    observedEl.remove();
  }

  render() {
    const observedElementId = 'back-to-top-observed';

    this.destroyObservedElement(observedElementId);

    this.element.innerHTML = `
      <button class="back-to-top-button is-hidden" aria-label="Back to Top" title="Back to Top">
        <svg width="22" height="12" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 10.9L10.9 1l9.899 9.9" stroke-width="2" stroke="#000" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="back-to-top-label">Top</div>
      </button>
    `;

    this.createObservedElement(observedElementId);

    this.element.querySelector('.back-to-top-button').addEventListener('click', this.handleClick);
    this.element.querySelector('.back-to-top-button').addEventListener('transitionend', this.removeTransitioningClass);
  }
}

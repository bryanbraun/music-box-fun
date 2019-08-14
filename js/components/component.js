import { musicBoxStore } from '../music-box-store.js';

// This base component lets us inherit the following functionality:
//
// 1. Assigning props for re-use outside the parent component's constructor
// 2. An element to attach to when rendering
// 3. Automatic re-rendering, triggered by a user-defined renderEvent
//
// If we don't need these features, we could skip inheriting from this base component
// and use a functional component instead.
export class Component {
  constructor(params = {}) {
    let renderEvent;

    // Allows us to access props outside the constructor
    this.props = params.props;

    // A default render function, just in case the inheriting component doesn't set one.
    this.render = this.render || function () { };

    // Store the HTML element to attach the render to if set.
    if (params.hasOwnProperty('element')) {
      this.element = params.element;
    }

    // If a renderTrigger event name is passed, subscribe re-renders to that event.
    if (params.renderTrigger) {
      musicBoxStore.events.subscribe(params.renderTrigger, () => this.render());
    }
  }
}

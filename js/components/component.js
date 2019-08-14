// We're importing the store Class here so we can test against it in the constructor
import { Store } from '../lib/store.js';

// This base component lets us inherit the following functionality:
//
// 1. Automatic re-rendering, triggered by a user-defined renderEvent
// 2. An element to attach to when rendering
// 3. Assigning props for re-use outside the parent component's constructor
//
// If we don't need these features, we could skip inheriting from this base component
// and use a functional component instead.

// TODO: see if we can import musicboxStore at the top instead of passing it as a param.
// It would simplify component creation.
export class Component {
  constructor(params = {}) {
    let renderEvent;

    // Allows us to access props outside the constructor
    this.props = params.props;

    // We're setting a render function as the one set by whatever inherits this base
    // class or setting it to an empty by default. This is so nothing breaks if someone
    // forgets to set it.
    this.render = this.render || function () { };

    // If there's a store passed in, subscribe to a state change to trigger re-renders.
    // We subscribe to 'stateChange' by default but you can pass in a more specific event.
    if (params.musicBoxStore instanceof Store) {
      renderEvent = params.renderTrigger || 'stateChange'
      params.musicBoxStore.events.subscribe(renderEvent, () => this.render());
    }

    // Store the HTML element to attach the render to if set.
    if (params.hasOwnProperty('element')) {
      this.element = params.element;
    }
  }
}

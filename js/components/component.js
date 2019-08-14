// We're importing the store Class here so we can test against it in the constructor
import { Store } from '../lib/store.js';

export class Component {
  constructor(props = {}) {
    let self = this;
    let renderEvent;

    // We're setting a render function as the one set by whatever inherits this base
    // class or setting it to an empty by default. This is so nothing breaks if someone
    // forgets to set it.
    this.render = this.render || function () { };

    // If there's a store passed in, subscribe to a state change to trigger re-renders.
    // We subscribe to 'stateChange' by default but you can pass in a more specific event.
    if (props.musicBoxStore instanceof Store) {
      renderEvent = props.renderTrigger || 'stateChange'
      props.musicBoxStore.events.subscribe(renderEvent, () => self.render());
    }

    // Store the HTML element to attach the render to if set
    if (props.hasOwnProperty('element')) {
      this.element = props.element;
    }
  }
}

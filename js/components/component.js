import { musicBoxStore } from '../music-box-store.js';

// This base component lets us inherit the following functionality:
//
// 1. Assigning props for re-use outside the parent component's constructor
// 2. An element that we can reference via this.element (usually inside render())
// 3. Local state and a setState function for changing it
// 4. A renderTrigger, for re-rendering based on centralized state changes
export class Component {
  constructor(params = {}) {
    this.props = params.props;
    this.element = params.element;
    this.render = this.render || function () { };
    this.state = {};

    this.setState = (newStateObj) => {
      this.state = Object.assign({}, this.state, newStateObj);
      this.render();
    };

    if (params.renderTrigger) {
      const renderTriggerArray = [].concat(params.renderTrigger);
      renderTriggerArray.forEach(renderTrigger => {
        musicBoxStore.subscribe(renderTrigger, () => this.render());
      });
    }
  }
}

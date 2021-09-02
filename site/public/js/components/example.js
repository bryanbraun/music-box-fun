import { MBComponent } from '../music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';

// An example component you can copy-and-paste when creating new components.
export class Example extends MBComponent {
  constructor(props) {
    super({
      // Do you want to use props outside the constructor? If so, pass them to
      // the parent component here.
      props,

      // Do you want this component to re-render based on a global state change?
      // If so, assign the state change event to renderTrigger here. For example:
      //
      //   "state" (any change to state)
      //   "appState.isPlaying" (any change to the isPlaying value)
      //   (any other key from state.js, like "songState.songData" or "songState.songData.C4")
      //
      // Note: if you use renderTrigger, your element must have an ID attribute, to
      //       prevent duplicate subscribes. For more info, see base-component.js.
      renderTrigger: 'state',

      // Which DOM element does this component correspond to? Query it here so
      // We can reference it in our render function below.
      element: document.querySelector('#example')
    });

    // Using local state? Set the initial values here in the constructor.
    this.state.counter = 0;

    // To use "this" inside of our methods, bind it here in the constructor.
    this.incrementCounter = this.incrementCounter.bind(this);
  }

  incrementCounter() {
    this.setState({ counter: this.state.counter + 1})
  }

  render() {
    console.log('Example was rendered');

    this.element.innerHTML = `
      <p>Data from props: ${this.props.exampleDataFromProps}</p>
      <p>Data from global state: ${musicBoxStore.state.exampleDataFromState}</p>
      <button>${this.state.counter}</button>
    `;

    this.element.querySelector('button').addEventListener('click', incrementCounter);
  }
}

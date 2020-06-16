import { Component } from '../alt-react/component.js';
import { musicBoxStore } from '../music-box-store.js';

export class Example extends Component {
  constructor(props) {
    super({
      // Do you want to use props outside the constructor? If so, pass them to
      // the parent component here.
      props,

      // Do you want this component to re-render based on a future state change?
      // If so, assign the state change event to renderTrigger here. For example:
      //
      //   "state" (any change to state)
      //   "songTitle" (any change to the songTitle)
      //   (any other key from state.js, like "songData" or "C4")
      renderTrigger: 'state',

      // Which DOM element does this component correspond to? Query it here so
      // We can reference it in our render function below.
      element: document.querySelector('#example')
    });
  }

  render() {
    console.log('Example was rendered');

    this.element.innerHTML = `
      <p>Data from props: ${this.props.exampleDataFromProps}</p>
      <p>Data from central state: ${musicBoxStore.state.exampleDataFromState}</p>
    `;

    this.element.addEventListener('click', event => {
      console.log(`you clicked ${event.target}`);
    });
  }
}

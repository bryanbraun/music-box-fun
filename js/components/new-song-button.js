import { Component } from '../alt-react/component.js';

export class NewSongButton extends Component {
  constructor() {
    super({
      element: document.querySelector('#file')
    });
  }

  handleClick() {
    window.location.href = window.location.origin;
  }

  render() {
    this.element.innerHTML = `
      <button class="new-song">New blank song</button>
    `;

    this.element.querySelector('button').addEventListener('click', this.handleClick);
  }
}

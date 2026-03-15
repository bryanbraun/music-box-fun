import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { getCurrentBoxType } from '../common/box-types.js';

export class ThickerStaffLinesToggle extends MBComponent {
  constructor() {
    super({
      element: document.querySelector('#thicker-staff-lines-toggle'),
      renderTrigger: ['appState.thickerStaffLines', 'songState.songData'],
    });

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const currentBoxType = getCurrentBoxType();

    musicBoxStore.setState('appState.thickerStaffLines', event.target.checked);
  }

  render() {
    const currentBoxType = getCurrentBoxType();
    const isDisabled = !['15', '20'].includes(currentBoxType);
    const checked = musicBoxStore.state.appState.thickerStaffLines === true ? 'checked' : '';
    const disabled = isDisabled ? 'disabled' : '';

    this.element.innerHTML = `
      <label class="thicker-staff-lines-toggle">
        <input
          class="thicker-staff-lines-toggle__checkbox"
          type="checkbox"
          name="thicker-staff-lines"
          ${checked}
          ${disabled}
        />
        <span>Thicker staff lines</span>
      </label>
    `;

    this.element.querySelector('input[type="checkbox"]').addEventListener('change', this.handleChange);
  }
}

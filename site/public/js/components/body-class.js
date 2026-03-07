import { MBComponent } from './music-box-component.js';
import { musicBoxStore } from '../music-box-store.js';
import { getCurrentBoxType } from '../common/box-types.js';
import classNames from '../vendor/classnames.js';

export class BodyClass extends MBComponent {
  constructor() {
    super({
      renderTrigger: ['appState.isPlaying', 'appState.offCanvasSidebarFocused', 'songState.songData', 'appState.thickerStaffLines'],
      element: document.body
    });

    this.state.lastInputType = '';

    // Provide an outline.js replacement to preserves focus rings for keyboard users.
    document.addEventListener('mousedown', () => this.setState({ lastInputType: 'mouse' }));
    document.addEventListener('keydown', () => this.setState({ lastInputType: 'keyboard' }));
  }

  // Limit render changes to body-class updates, so we don't need to rebuild internal components.
  render() {
    const currentBoxType = getCurrentBoxType();
    const paperCanHaveStaffLines = ['15', '20'].includes(currentBoxType)

    this.element.className = classNames(
      `box-type-${currentBoxType}`,
      {
        'thicker-staff-lines': musicBoxStore.state.appState.thickerStaffLines === true && paperCanHaveStaffLines,
        'no-focus': this.state.lastInputType === 'mouse',
        'no-scroll': musicBoxStore.state.appState.isPlaying === true ||
          musicBoxStore.state.appState.offCanvasSidebarFocused !== 'none'
      });
  }
}

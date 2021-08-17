import { BaseComponent } from './alt-react/base-component.js';
import { musicBoxStore } from './music-box-store.js';

// MBComponent is a component connected to the musicBoxStore (used for renderTrigger).
export class MBComponent extends BaseComponent {
  constructor(params = {}) {
    super({ ...params, store: musicBoxStore })
  }
}

import { PubSub } from './pubsub.js';

export class Store {
  constructor(params) {
    let self = this;

    self.actions = params.actions || {};
    self.status = 'resting';
    self.events = new PubSub();

    // Make our state a Proxy, so we can publish events when state is changed.
    // We use 'get' to recursively create Proxies on the fly for nested data.
    const proxyHandler = {
      get(target, key) {
        if (typeof target[key] === 'object' && target[key] !== null) {
          return new Proxy(target[key], proxyHandler)
        }
        return target[key];
      },
      set(state, key, value) {
        // Set the value as we would normally
        state[key] = value;

        // Trace out to the console. This will be grouped by the related action
        console.log(`stateChange: ${key}: ${value}`);

        // Publish a generic event, announcing that there was state change.
        self.events.publish('state', self.state);

        // Publish a specific event for the part of state that was changed.
        self.events.publish(key, value);

        // Give the user a little telling off if they set a value directly
        if (self.status !== 'action') {
          console.warn(`You should use a action to set ${key}`);
        }

        // Reset the status ready for the next operation
        self.status = 'resting';

        return true;
      }
    };

    self.state = new Proxy((params.state || {}), proxyHandler);
  }

  /**
   * A dispatcher for actions that looks in the actions
   * collection and runs the action if it can find it
   *
   * @param {string} actionKey
   * @param {mixed} payload
   * @returns {boolean}
   * @memberof Store
   */
  dispatch(actionKey, payload) {
    let self = this;

    // Run a quick check to ensure the action exists before we try to run it
    if (typeof self.actions[actionKey] !== 'function') {
      console.error(`Action "${actionKey} doesn't exist.`);
      return false;
    }

    console.groupCollapsed(`ACTION: ${actionKey}`);

    // Let anything that's watching the status know that we're dispatching an action
    self.status = 'action';

    // Actually call the action and pass it the Store context and whatever payload was passed
    self.actions[actionKey](self.state, payload);

    console.groupEnd();

    return true;
  }
}

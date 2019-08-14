import { PubSub } from './pubsub.js';

export class Store {
  constructor(params) {
    let self = this;

    // Add some default objects to hold our actions, mutations and state
    self.actions = {};
    self.mutations = {};
    self.state = {};

    // A status enum to set during actions and mutations
    self.status = 'resting';

    // Attach our PubSub module as an `events` element
    self.events = new PubSub();

    // Look in the passed params object for actions and mutations
    // that might have been passed in
    if (params.hasOwnProperty('actions')) {
      self.actions = params.actions;
    }

    if (params.hasOwnProperty('mutations')) {
      self.mutations = params.mutations;
    }

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

        // When an array value is added, this 'set' trap is run twice... once
        // for adding the array value, and once when the array's 'length'
        // property is updated internally. We don't care about this second
        // update, so we return early when this is the case.
        //
        // Update: This problem goes away when I store data as CSVs.
        // if (key === 'length') {
        //   return true;
        // }

        // Trace out to the console. This will be grouped by the related action
        console.log(`stateChange: ${key}: ${value}`);

        // Publish the change event for the components that are listening
        self.events.publish('stateChange', self.state);
        // Publish a new event for making updates based on changes to specific keys.
        self.events.publish(key, value);

        // Give the user a little telling off if they set a value directly
        if (self.status !== 'mutation') {
          console.warn(`You should use a mutation to set ${key}`);
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

    // Run a quick check to see if the action actually exists
    // before we try to run it
    if (typeof self.actions[actionKey] !== 'function') {
      console.error(`Action "${actionKey} doesn't exist.`);
      return false;
    }

    // Create a console group which will contain the logs from our Proxy etc
    console.groupCollapsed(`ACTION: ${actionKey}`);

    // Let anything that's watching the status know that we're dispatching an action
    self.status = 'action';

    // Actually call the action and pass it the Store context and whatever payload was passed
    self.actions[actionKey](self, payload);

    // Close our console group to keep things nice and neat
    console.groupEnd();

    return true;
  }

  /**
   * Look for a mutation and modify the state object
   * if that mutation exists by calling it
   *
   * @param {string} mutationKey
   * @param {mixed} payload
   * @returns {boolean}
   * @memberof Store
   */
  commit(mutationKey, payload) {
    let self = this;

    // Run a quick check to see if this mutation actually exists
    // before trying to run it
    if (typeof self.mutations[mutationKey] !== 'function') {
      console.log(`Mutation "${mutationKey}" doesn't exist`);
      return false;
    }

    // Let anything that's watching the status know that we're mutating state
    self.status = 'mutation';

    // Get a new version of the state by running the mutation
    self.mutations[mutationKey](self.state, payload);

    return true;
  }
}

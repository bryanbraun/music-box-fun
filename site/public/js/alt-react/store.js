import { isPlainObject, getSegments, isEqual } from './utils.js';

export class Store {
  constructor(initialState) {
    this.events = {};
    this.state = initialState;
  }

  /**
   * Sets a value to the location in state defined by the propertyString. Like Lodash's _.set().
   * Note: it currently doesn't create nonexisting properties on the fly.
   * Returns 'true' if a mutation happened and events were published. Returns false otherwise.
   */
  setState(propertyString, value) {
    let isObjectWithInternalMutations = false;
    let isAssignmentIdentical = false;

    // If we are trying to setState for a whole object, we should first setState on its individual
    // properties. This ensures that we publish events for each of the actual things that are being
    // changed, and we don't miss anything that needs to be re-rendered. This is a recursive check.
    //
    // Once we are sure that we've triggered events on all changing child properties, we finish by
    // setting the whole object. This is needed to blow away any data that exists in the old object but
    // not the new one. By tracking whether changes were made in any child properties, we know whether
    // we need to fire an event for the parent object (if the old and new objects are identical, no events
    // will end up being be triggered at all).
    //
    // (Note: This doesn't handle arrays containing objects with their own properties.
    // It's an edge-case we may never need, that would add unnecessary complexity right now.)
    if (isPlainObject(value)) {
      Object.keys(value).forEach(key => {
        let isPropertyChanged = this.setState(`${propertyString}.${key}`, value[key]);

        if (isPropertyChanged) {
          isObjectWithInternalMutations = true;
        }
      });
    }

    // Step down into our state object and assign the appropriate value.
    getSegments(propertyString).reduce((accumulator, currentSegment, index, array) => {
      let currentKey = currentSegment.charAt(0) === '[' ? currentSegment.replace('[', '').replace(']', '') : currentSegment;
      let isFinalSegment = (index + 1 === array.length);

      if (isFinalSegment) {
        if (!isEqual(accumulator[currentKey], value)) {
          accumulator[currentKey] = value; // Set our property!
        } else {
          isAssignmentIdentical = true;
        }

        return true;
      }

      // Otherwise, continue stepping down
      return accumulator && accumulator[currentKey] ? accumulator[currentKey] : null;
    }, this.state);

    // Exit early if the attempted update was unnecessary.
    if (isAssignmentIdentical && !isObjectWithInternalMutations) return false;

    // Build up a set of event strings to publish, based on the propertyString.
    //
    //   propertyString: 'city.street[0].color'
    //   publishes: ['city*', 'city.street*', 'city.street[0]*', 'city.street[0].color']
    //
    // Note: The '*' indicates that the change was made to a nested property. In other words,
    // "Something in me was changed". These "bubbling" events enable some useful re-renders.
    const eventsToPublish = getSegments(propertyString)
      .map((item, index, array) => { // Build the array.
        return array.slice(0, index + 1).reduce((acc, currentVal) => {
          return currentVal.charAt(0) === '[' ? `${acc}${currentVal}` : `${acc}.${currentVal}`;
        });
      }).map((item, index, array) => { // Add the *'s for bubbling events.
        return (array.length - 1 === index) ? item : `${item}*`;
      });

    // Publish a generic "state was updated" event, followed by the more specific events.
    this.publish('state*');
    eventsToPublish.forEach(eventString => this.publish(eventString));

    return true;
  }

  publish(event, data = {}) {
    if (!this.events.hasOwnProperty(event)) {
      return [];
    }

    return this.events[event].map(callback => callback(data));
  }

  subscribe(event, callback) {
    if (!this.events.hasOwnProperty(event)) {
      this.events[event] = [];
    }

    return this.events[event].push(callback);
  }
}

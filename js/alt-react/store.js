export class Store {
  constructor(initialState) {
    this.events = {};
    this.state = initialState;
  }

  /**
   * A simplified version of _.set(), setting our state instead of an arbitrary object.
   * Note: it currently doesn't create nonexisting properties on the fly.
   */
  setState(propertyString, value) {
    // This Regex was borrowed from https://github.com/lodash/lodash/blob/4.17.15-es/_stringToPath.js
    const propertyNameMatcher = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    const propertyArray = [];
    const propertySegments = [];

    // Split our string into an array of values
    propertyString.replace(propertyNameMatcher, function (match, number) {
      propertyArray.push(number || match);
      propertySegments.push(match);
    });

    propertyArray.reduce((accumulator, currentVal, index, array) => {
      if (index + 1 === array.length) {
        accumulator[currentVal] = value; // Set our property!
        return true;
      }

      // Otherwise, continue stepping down
      return accumulator && accumulator[currentVal] ? accumulator[currentVal] : null;
    }, this.state);

    // Build up a set of event strings to publish, based on the propertyString.
    // This enables us to do granular re-renders, if we want to.
    //   example: 'city.street[0].color'
    //   returns: ['city', 'city.street', 'city.street[0]', 'city.street[0].color']
    const eventsToPublish = propertySegments.map((item, index, array) => {
      return array.slice(0, index + 1).reduce((acc, currentVal) => {
        return currentVal.charAt(0) === '[' ? `${acc}${currentVal}` : `${acc}.${currentVal}`;
      });
    });

    // Publish a generic "state was updated" event, followed by the more specific events.
    this.publish('state');
    eventsToPublish.forEach(eventString => this.publish(eventString));
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

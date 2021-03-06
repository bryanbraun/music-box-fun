// Borrowed from jQuery. See: https://github.com/jquery/jquery/blob/master/src/core.js#L202
export function isPlainObject(testValue) {
		let proto, Ctor;

		// Detect obvious negatives
		if (!testValue || ({}).toString.call(testValue) !== '[object Object]') return false;

		proto = Object.getPrototypeOf(testValue);

		// Objects with no prototype (e.g., `Object.create(null)`) are plain
		if (!proto) return true;

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = ({}).hasOwnProperty.call(proto, 'constructor') && proto.constructor;
		return typeof Ctor === 'function' && ({}).hasOwnProperty.toString.call(Ctor) === ({}).hasOwnProperty.toString.call(Object);
}

// Split our string into an array of values.
//
//   @param propertyString - ex: 'city.street[0].color'
//   @return Array - ex: ['city', 'street', '[0]', 'color']
//
// @todo: this could likely be optimized by memoizing it.
export function getSegments(propertyString) {
  // This Regex was borrowed from https://github.com/lodash/lodash/blob/4.17.15-es/_stringToPath.js
  const propertyNameMatcher = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  const propertySegments = [];

  propertyString.replace(propertyNameMatcher, function (match, number) {
    propertySegments.push(match);
  });

  return propertySegments
}

// This is _.isEqual from underscore.js, as pulled from source (with some manual)
// piecing together of modules. I used underscores instead of lodash because there was
// less code and it appeared to perform better in tests. It probably handles less edge-cases
// but it works well enough for what I need! For details, see:
// https://github.com/jashkenas/underscore/blob/977d4be74fe76227f5e9f3af9d640b46ab5b50dd/modules/isEqual.js
export function isEqual(a, b) {
  function isDataView(obj) {
    return Object.prototype.toString.call(obj) === '[object DataView]';
  }

  function isTypedArray(obj) {
    return ArrayBuffer.isView(obj) && !isDataView(obj);
  }

  function has(obj, key) {
    return obj != null && Object.prototype.hasOwnProperty.call(obj, key);
  }

  function getByteLength(obj) {
    return obj == null ? void 0 : obj['byteLength'];
  };

  function isFunction(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
  }

  // Internal recursive comparison function for `isEqual`.
  function eq(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  }

  // Internal recursive comparison function for `isEqual`.
  function deepEq(a, b, aStack, bStack) {
    // Compare `[[Class]]` names.
    var className = Object.prototype.toString.call(a);
    if (className !== Object.prototype.toString.call(b)) return false;
    switch (className) {
      // These types are compared by value.
      case '[object RegExp]':
        // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        return Symbol.prototype.valueOf.call(a) === Symbol.prototype.valueOf.call(b);
      case '[object ArrayBuffer]':
        // Coerce to `DataView` so we can fall through to the next case.
        return deepEq(new DataView(a), new DataView(b), aStack, bStack);
      case '[object DataView]':
        var byteLength = getByteLength(a);
        if (byteLength !== getByteLength(b)) {
          return false;
        }
        while (byteLength--) {
          if (a.getUint8(byteLength) !== b.getUint8(byteLength)) {
            return false;
          }
        }
        return true;
    }

    if (isTypedArray(a)) {
      // Coerce typed arrays to `DataView`.
      return deepEq(new DataView(a.buffer), new DataView(b.buffer), aStack, bStack);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor &&
                              isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var _keys = Object.keys(a), key;
      length = _keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (Object.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = _keys[length];
        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  }

  return eq(a, b);
}

# URL Data

Whenever a song is updated, all of the song data is encoded and compressed into the URL.

It's crucial that songs, once created, don't break for people in the future. That means if we ever change how songs are encoded or stored, we need those changes to be backwards compatible.

We want to minimize these kinds of changes to keep our code as simple as possible.

## How URL data is encoded and stored

### Encoding
Our data is encoded with the [json-url](https://github.com/masotime/json-url) library, which takes our `songState` javascript object and runs it through a compression algorithm.

I tested several algorithms early in the project and here are the results I got:

|                             | LZW | LZMA | LZSTRING | PACK |
|-----------------------------|-----|------|----------|------|
| Small JS Object (50 bytes)   | 56  | 80   | 75       | 48   |
| Empty Song (177 bytes)      | 142 | 128  | 142      | 139  |
| Mid-length Song (441 bytes) | 471 | 371  | 390      | 399  |
| Long Song (925 bytes)       | 931 | 640  | 723      | 808  |

LZMA was consistently better for all objects large enough to represent songs.

Making changes to the state object we are encoding/decoding could affect compatibilty, as older songs won't include those changes. *Here's what backwards-compatibility looks like for some common state operations*:

- Removing an existing key and value from our song state, with code that references it: **Safe**
- Adding a new key and value to our song state, with code that references it: **Safe, if defaults are provided**
- Changing the name of a key in our song state, including code that references it: **Unsafe**
- Changing the depth or structure of our song state, with code that references it: **Unsafe**
- Changing the datatype of a value in our song state (like CSV -> Array): **Unsafe**
- Changing the listed order of keys in our song state: **Safe**
- Making changes to our app state object, or code that references it: **Safe**

### Storage

Data is stored as a URL fragment, like this:
```
https://musicboxfun.com/#0XQAAAAJkAAAAAAAAAABBqkpm86JnXhcgipzr6UI7GqNSYF...
                         ||
    version number ──────┘└───── Beginning of encoded song data
```

The version number is intended to be a single character that can be bumped from 0-9 (then a-z, and then A-Z), whenever our URL Encoding/Storage system needs to change. This way, we can continue to support older songs.

The maximum URL length is 2047 characters (this [differs by browser](https://stackoverflow.com/a/11551718/1154642) but as of 2019, several "2047 browsers" are actively used).

This means we have about 2022 characters available for song data. If we start to get close to this limit, we should look into better compression techniques.

## Version History

### Un-versioned

There was no version while 'Music Box Fun' was in ALPHA. Thus, no backwards compatibility was guaranteed here.

Encoding: LZMA
songState: {
  songTitle: "",
  playSpeed: 0,
  songData: {
    C4: "",
    D4: "",
    ...
  }
}

### Version 0

Breaking changes:
- Added a version number
- Created a custom minification map, to manually minify the songState when compressing, and unminify it when decompressing. This saves about 40 characters and the savings will increase as songState gets more complex over time.
- Changed the CSV notes to Arrays (this compresses better).

### Future ideas
- A custom, domain-specific encoding?

# URL Data

Whenever a song is updated, all of the song data is encoded and stored in the URL.

It's crucial that songs, once created, don't break for people in the future. That means if we ever change how songs are encoded or stored, we need those changes to be backwards compatible.

We want to minimize these kinds of changes to keep our code as simple as possible.

## How URL data is encoded and stored

### Encoding
Our data is encoded with the [json-url](https://github.com/masotime/json-url) library, which takes our `songState` javascript object and runs it through a compression algorithm.

The `songTitle` is the only property that accepts arbitrary user input. These titles are added to `songState` as-is, meaning, there is no html-encoding of individual characters when the data is stored. Instead, we are careful when displaying these titles to set them as textContent or html-encode them before embedding them as innerHTML (to prevent XSS issues).

I tested several algorithms early in the project and here are the results I got:

|                             | LZW | LZMA | LZSTRING | PACK |
| --------------------------- | --- | ---- | -------- | ---- |
| Small JS Object (50 bytes)  | 56  | 80   | 75       | 48   |
| Empty Song (177 bytes)      | 142 | 128  | 142      | 139  |
| Mid-length Song (441 bytes) | 471 | 371  | 390      | 399  |
| Long Song (925 bytes)       | 931 | 640  | 723      | 808  |

LZMA was consistently better for all objects large enough to represent songs.

Making changes to the state object we are encoding/decoding could affect compatibility, as older songs won't include those changes. *Here's what backwards-compatibility looks like for some common state operations*:

- Removing an existing key and value from our song state, with code that references it: **Safe**
- Adding a new key and value to our song state, with code that references it: **Safe, if defaults are provided**
- Changing the name of a key in our song state, including code that references it: **Unsafe**
- Changing the depth or structure of our song state, with code that references it: **Unsafe**
- Changing the datatype of a value in our song state (like CSV -> Array): **Unsafe**
- Changing the listed order of keys in our song state: **Safe**
- Making changes to our app state object, or code that references it: **Safe**

In general, you just have to ask yourself, "If the URL gives me an old state object, can my new version of my app load it properly?"

### Storage

Data is stored as a URL fragment, like this:
```
https://musicbox.fun/#0XQAAAAJkAAAAAAAAAABBqkpm86JnXhcgipzr6UI7GqNSYF...
                      ||
    version number ───┘└───── Beginning of encoded song data
```

The version number is intended to be a single character that can be bumped from 0-9 (then a-z, and then A-Z), whenever our URL Encoding/Storage system needs to change. This way, we can continue to support older songs.

The maximum URL length is 2047 characters (this [differs by browser](https://stackoverflow.com/a/11551718/1154642) but as of 2019, several "2047 browsers" are actively used).

This means we have about 2022 characters available for song data. If we start to get close to this limit, we should look into better compression techniques.

## Version History

Our approach to handling older songs is to adapt their data to work for the newest version of the app, and to do it all at once, when pulling the data out of the URL. This way, we don't have fallbacks and versioning logic scattered throughout the whole app. For details on this approach, see `version-adapters.js`.

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
- Removed "playSpeed" from state (to be reintroduced later as "tempo").

### Version 1

Breaking changes:
- Change the stored yPos data to represent the "note-center" or "strike-time" of the note, instead of the y-position of the top of a "standard" (16px) note.
- Adjust bar lengths from 50px to 48px, and adapt the data of existing songs accordingly.

See the `version-adapters.js` file for more details.

### Future ideas
- A custom, domain-specific encoding?

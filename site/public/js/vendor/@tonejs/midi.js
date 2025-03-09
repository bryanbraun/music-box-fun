import { c as createCommonjsModule, a as commonjsGlobal, g as getDefaultExportFromCjs } from '../common/_commonjsHelpers-8c19dec8.js';

// data can be any array-like object.  It just needs to support .length, .slice, and an element getter []

function parseMidi(data) {
  var p = new Parser(data);

  var headerChunk = p.readChunk();
  if (headerChunk.id != 'MThd')
    throw "Bad MIDI file.  Expected 'MHdr', got: '" + headerChunk.id + "'"
  var header = parseHeader(headerChunk.data);

  var tracks = [];
  for (var i=0; !p.eof() && i < header.numTracks; i++) {
    var trackChunk = p.readChunk();
    if (trackChunk.id != 'MTrk')
      throw "Bad MIDI file.  Expected 'MTrk', got: '" + trackChunk.id + "'"
    var track = parseTrack(trackChunk.data);
    tracks.push(track);
  }

  return {
    header: header,
    tracks: tracks
  }
}


function parseHeader(data) {
  var p = new Parser(data);

  var format = p.readUInt16();
  var numTracks = p.readUInt16();

  var result = {
    format: format,
    numTracks: numTracks
  };

  var timeDivision = p.readUInt16();
  if (timeDivision & 0x8000) {
    result.framesPerSecond = 0x100 - (timeDivision >> 8);
    result.ticksPerFrame = timeDivision & 0xFF;
  } else {
    result.ticksPerBeat = timeDivision;
  }

  return result
}

function parseTrack(data) {
  var p = new Parser(data);

  var events = [];
  while (!p.eof()) {
    var event = readEvent();
    events.push(event);
  }

  return events

  var lastEventTypeByte = null;

  function readEvent() {
    var event = {};
    event.deltaTime = p.readVarInt();

    var eventTypeByte = p.readUInt8();

    if ((eventTypeByte & 0xf0) === 0xf0) {
      // system / meta event
      if (eventTypeByte === 0xff) {
        // meta event
        event.meta = true;
        var metatypeByte = p.readUInt8();
        var length = p.readVarInt();
        switch (metatypeByte) {
          case 0x00:
            event.type = 'sequenceNumber';
            if (length !== 2) throw "Expected length for sequenceNumber event is 2, got " + length
            event.number = p.readUInt16();
            return event
          case 0x01:
            event.type = 'text';
            event.text = p.readString(length);
            return event
          case 0x02:
            event.type = 'copyrightNotice';
            event.text = p.readString(length);
            return event
          case 0x03:
            event.type = 'trackName';
            event.text = p.readString(length);
            return event
          case 0x04:
            event.type = 'instrumentName';
            event.text = p.readString(length);
            return event
          case 0x05:
            event.type = 'lyrics';
            event.text = p.readString(length);
            return event
          case 0x06:
            event.type = 'marker';
            event.text = p.readString(length);
            return event
          case 0x07:
            event.type = 'cuePoint';
            event.text = p.readString(length);
            return event
          case 0x20:
            event.type = 'channelPrefix';
            if (length != 1) throw "Expected length for channelPrefix event is 1, got " + length
            event.channel = p.readUInt8();
            return event
          case 0x21:
            event.type = 'portPrefix';
            if (length != 1) throw "Expected length for portPrefix event is 1, got " + length
            event.port = p.readUInt8();
            return event
          case 0x2f:
            event.type = 'endOfTrack';
            if (length != 0) throw "Expected length for endOfTrack event is 0, got " + length
            return event
          case 0x51:
            event.type = 'setTempo';
            if (length != 3) throw "Expected length for setTempo event is 3, got " + length
            event.microsecondsPerBeat = p.readUInt24();
            return event
          case 0x54:
            event.type = 'smpteOffset';
            if (length != 5) throw "Expected length for smpteOffset event is 5, got " + length
            var hourByte = p.readUInt8();
            var FRAME_RATES = { 0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30 };
            event.frameRate = FRAME_RATES[hourByte & 0x60];
            event.hour = hourByte & 0x1f;
            event.min = p.readUInt8();
            event.sec = p.readUInt8();
            event.frame = p.readUInt8();
            event.subFrame = p.readUInt8();
            return event
          case 0x58:
            event.type = 'timeSignature';
            if (length != 2 && length != 4) throw "Expected length for timeSignature event is 4 or 2, got " + length
            event.numerator = p.readUInt8();
            event.denominator = (1 << p.readUInt8());
            if (length === 4) {
              event.metronome = p.readUInt8();
              event.thirtyseconds = p.readUInt8();
            } else {
              event.metronome = 0x24;
              event.thirtyseconds = 0x08;
            }
            return event
          case 0x59:
            event.type = 'keySignature';
            if (length != 2) throw "Expected length for keySignature event is 2, got " + length
            event.key = p.readInt8();
            event.scale = p.readUInt8();
            return event
          case 0x7f:
            event.type = 'sequencerSpecific';
            event.data = p.readBytes(length);
            return event
          default:
            event.type = 'unknownMeta';
            event.data = p.readBytes(length);
            event.metatypeByte = metatypeByte;
            return event
        }
      } else if (eventTypeByte == 0xf0) {
        event.type = 'sysEx';
        var length = p.readVarInt();
        event.data = p.readBytes(length);
        return event
      } else if (eventTypeByte == 0xf7) {
        event.type = 'endSysEx';
        var length = p.readVarInt();
        event.data = p.readBytes(length);
        return event
      } else {
        throw "Unrecognised MIDI event type byte: " + eventTypeByte
      }
    } else {
      // channel event
      var param1;
      if ((eventTypeByte & 0x80) === 0) {
        // running status - reuse lastEventTypeByte as the event type.
        // eventTypeByte is actually the first parameter
        if (lastEventTypeByte === null)
          throw "Running status byte encountered before status byte"
        param1 = eventTypeByte;
        eventTypeByte = lastEventTypeByte;
        event.running = true;
      } else {
        param1 = p.readUInt8();
        lastEventTypeByte = eventTypeByte;
      }
      var eventType = eventTypeByte >> 4;
      event.channel = eventTypeByte & 0x0f;
      switch (eventType) {
        case 0x08:
          event.type = 'noteOff';
          event.noteNumber = param1;
          event.velocity = p.readUInt8();
          return event
        case 0x09:
          var velocity = p.readUInt8();
          event.type = velocity === 0 ? 'noteOff' : 'noteOn';
          event.noteNumber = param1;
          event.velocity = velocity;
          if (velocity === 0) event.byte9 = true;
          return event
        case 0x0a:
          event.type = 'noteAftertouch';
          event.noteNumber = param1;
          event.amount = p.readUInt8();
          return event
        case 0x0b:
          event.type = 'controller';
          event.controllerType = param1;
          event.value = p.readUInt8();
          return event
        case 0x0c:
          event.type = 'programChange';
          event.programNumber = param1;
          return event
        case 0x0d:
          event.type = 'channelAftertouch';
          event.amount = param1;
          return event
        case 0x0e:
          event.type = 'pitchBend';
          event.value = (param1 + (p.readUInt8() << 7)) - 0x2000;
          return event
        default:
          throw "Unrecognised MIDI event type: " + eventType
      }
    }
  }
}

function Parser(data) {
  this.buffer = data;
  this.bufferLen = this.buffer.length;
  this.pos = 0;
}

Parser.prototype.eof = function() {
  return this.pos >= this.bufferLen
};

Parser.prototype.readUInt8 = function() {
  var result = this.buffer[this.pos];
  this.pos += 1;
  return result
};

Parser.prototype.readInt8 = function() {
  var u = this.readUInt8();
  if (u & 0x80)
    return u - 0x100
  else
    return u
};

Parser.prototype.readUInt16 = function() {
  var b0 = this.readUInt8(),
      b1 = this.readUInt8();

    return (b0 << 8) + b1
};

Parser.prototype.readInt16 = function() {
  var u = this.readUInt16();
  if (u & 0x8000)
    return u - 0x10000
  else
    return u
};

Parser.prototype.readUInt24 = function() {
  var b0 = this.readUInt8(),
      b1 = this.readUInt8(),
      b2 = this.readUInt8();

    return (b0 << 16) + (b1 << 8) + b2
};

Parser.prototype.readInt24 = function() {
  var u = this.readUInt24();
  if (u & 0x800000)
    return u - 0x1000000
  else
    return u
};

Parser.prototype.readUInt32 = function() {
  var b0 = this.readUInt8(),
      b1 = this.readUInt8(),
      b2 = this.readUInt8(),
      b3 = this.readUInt8();

    return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3
};

Parser.prototype.readBytes = function(len) {
  var bytes = this.buffer.slice(this.pos, this.pos + len);
  this.pos += len;
  return bytes
};

Parser.prototype.readString = function(len) {
  var bytes = this.readBytes(len);
  return String.fromCharCode.apply(null, bytes)
};

Parser.prototype.readVarInt = function() {
  var result = 0;
  while (!this.eof()) {
    var b = this.readUInt8();
    if (b & 0x80) {
      result += (b & 0x7f);
      result <<= 7;
    } else {
      // b is last byte
      return result + b
    }
  }
  // premature eof
  return result
};

Parser.prototype.readChunk = function() {
  var id = this.readString(4);
  var length = this.readUInt32();
  var data = this.readBytes(length);
  return {
    id: id,
    length: length,
    data: data
  }
};

var midiParser = parseMidi;

// data should be the same type of format returned by parseMidi
// for maximum compatibililty, returns an array of byte values, suitable for conversion to Buffer, Uint8Array, etc.

// opts:
// - running              reuse previous eventTypeByte when possible, to compress file
// - useByte9ForNoteOff   use 0x09 for noteOff when velocity is zero

function writeMidi(data, opts) {
  if (typeof data !== 'object')
    throw 'Invalid MIDI data'

  opts = opts || {};

  var header = data.header || {};
  var tracks = data.tracks || [];
  var i, len = tracks.length;

  var w = new Writer();
  writeHeader(w, header, len);

  for (i=0; i < len; i++) {
    writeTrack(w, tracks[i], opts);
  }

  return w.buffer
}

function writeHeader(w, header, numTracks) {
  var format = header.format == null ? 1 : header.format;

  var timeDivision = 128;
  if (header.timeDivision) {
    timeDivision = header.timeDivision;
  } else if (header.ticksPerFrame && header.framesPerSecond) {
    timeDivision = (-(header.framesPerSecond & 0xFF) << 8) | (header.ticksPerFrame & 0xFF);
  } else if (header.ticksPerBeat) {
    timeDivision = header.ticksPerBeat & 0x7FFF;
  }

  var h = new Writer();
  h.writeUInt16(format);
  h.writeUInt16(numTracks);
  h.writeUInt16(timeDivision);

  w.writeChunk('MThd', h.buffer);
}

function writeTrack(w, track, opts) {
  var t = new Writer();
  var i, len = track.length;
  var eventTypeByte = null;
  for (i=0; i < len; i++) {
    // Reuse last eventTypeByte when opts.running is set, or event.running is explicitly set on it.
    // parseMidi will set event.running for each event, so that we can get an exact copy by default.
    // Explicitly set opts.running to false, to override event.running and never reuse last eventTypeByte.
    if (opts.running === false || !opts.running && !track[i].running) eventTypeByte = null;

    eventTypeByte = writeEvent(t, track[i], eventTypeByte, opts.useByte9ForNoteOff);
  }
  w.writeChunk('MTrk', t.buffer);
}

function writeEvent(w, event, lastEventTypeByte, useByte9ForNoteOff) {
  var type = event.type;
  var deltaTime = event.deltaTime;
  var text = event.text || '';
  var data = event.data || [];
  var eventTypeByte = null;
  w.writeVarInt(deltaTime);

  switch (type) {
    // meta events
    case 'sequenceNumber':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x00);
      w.writeVarInt(2);
      w.writeUInt16(event.number);
      break;

    case 'text':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x01);
      w.writeVarInt(text.length);
      w.writeString(text);
      break;

    case 'copyrightNotice':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x02);
      w.writeVarInt(text.length);
      w.writeString(text);
      break;

    case 'trackName':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x03);
      w.writeVarInt(text.length);
      w.writeString(text);
      break;

    case 'instrumentName':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x04);
      w.writeVarInt(text.length);
      w.writeString(text);
      break;

    case 'lyrics':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x05);
      w.writeVarInt(text.length);
      w.writeString(text);
      break;

    case 'marker':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x06);
      w.writeVarInt(text.length);
      w.writeString(text);
      break;

    case 'cuePoint':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x07);
      w.writeVarInt(text.length);
      w.writeString(text);
      break;

    case 'channelPrefix':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x20);
      w.writeVarInt(1);
      w.writeUInt8(event.channel);
      break;

    case 'portPrefix':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x21);
      w.writeVarInt(1);
      w.writeUInt8(event.port);
      break;

    case 'endOfTrack':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x2F);
      w.writeVarInt(0);
      break;

    case 'setTempo':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x51);
      w.writeVarInt(3);
      w.writeUInt24(event.microsecondsPerBeat);
      break;

    case 'smpteOffset':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x54);
      w.writeVarInt(5);
      var FRAME_RATES = { 24: 0x00, 25: 0x20, 29: 0x40, 30: 0x60 };
      var hourByte = (event.hour & 0x1F) | FRAME_RATES[event.frameRate];
      w.writeUInt8(hourByte);
      w.writeUInt8(event.min);
      w.writeUInt8(event.sec);
      w.writeUInt8(event.frame);
      w.writeUInt8(event.subFrame);
      break;

    case 'timeSignature':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x58);
      w.writeVarInt(4);
      w.writeUInt8(event.numerator);
      var denominator = Math.floor((Math.log(event.denominator) / Math.LN2)) & 0xFF;
      w.writeUInt8(denominator);
      w.writeUInt8(event.metronome);
      w.writeUInt8(event.thirtyseconds || 8);
      break;

    case 'keySignature':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x59);
      w.writeVarInt(2);
      w.writeInt8(event.key);
      w.writeUInt8(event.scale);
      break;

    case 'sequencerSpecific':
      w.writeUInt8(0xFF);
      w.writeUInt8(0x7F);
      w.writeVarInt(data.length);
      w.writeBytes(data);
      break;

    case 'unknownMeta':
      if (event.metatypeByte != null) {
        w.writeUInt8(0xFF);
        w.writeUInt8(event.metatypeByte);
        w.writeVarInt(data.length);
        w.writeBytes(data);
      }
      break;

    // system-exclusive
    case 'sysEx':
      w.writeUInt8(0xF0);
      w.writeVarInt(data.length);
      w.writeBytes(data);
      break;

    case 'endSysEx':
      w.writeUInt8(0xF7);
      w.writeVarInt(data.length);
      w.writeBytes(data);
      break;

    // channel events
    case 'noteOff':
      // Use 0x90 when opts.useByte9ForNoteOff is set and velocity is zero, or when event.byte9 is explicitly set on it.
      // parseMidi will set event.byte9 for each event, so that we can get an exact copy by default.
      // Explicitly set opts.useByte9ForNoteOff to false, to override event.byte9 and always use 0x80 for noteOff events.
      var noteByte = ((useByte9ForNoteOff !== false && event.byte9) || (useByte9ForNoteOff && event.velocity == 0)) ? 0x90 : 0x80;

      eventTypeByte = noteByte | event.channel;
      if (eventTypeByte !== lastEventTypeByte) w.writeUInt8(eventTypeByte);
      w.writeUInt8(event.noteNumber);
      w.writeUInt8(event.velocity);
      break;

    case 'noteOn':
      eventTypeByte = 0x90 | event.channel;
      if (eventTypeByte !== lastEventTypeByte) w.writeUInt8(eventTypeByte);
      w.writeUInt8(event.noteNumber);
      w.writeUInt8(event.velocity);
      break;

    case 'noteAftertouch':
      eventTypeByte = 0xA0 | event.channel;
      if (eventTypeByte !== lastEventTypeByte) w.writeUInt8(eventTypeByte);
      w.writeUInt8(event.noteNumber);
      w.writeUInt8(event.amount);
      break;

    case 'controller':
      eventTypeByte = 0xB0 | event.channel;
      if (eventTypeByte !== lastEventTypeByte) w.writeUInt8(eventTypeByte);
      w.writeUInt8(event.controllerType);
      w.writeUInt8(event.value);
      break;

    case 'programChange':
      eventTypeByte = 0xC0 | event.channel;
      if (eventTypeByte !== lastEventTypeByte) w.writeUInt8(eventTypeByte);
      w.writeUInt8(event.programNumber);
      break;

    case 'channelAftertouch':
      eventTypeByte = 0xD0 | event.channel;
      if (eventTypeByte !== lastEventTypeByte) w.writeUInt8(eventTypeByte);
      w.writeUInt8(event.amount);
      break;

    case 'pitchBend':
      eventTypeByte = 0xE0 | event.channel;
      if (eventTypeByte !== lastEventTypeByte) w.writeUInt8(eventTypeByte);
      var value14 = 0x2000 + event.value;
      var lsb14 = (value14 & 0x7F);
      var msb14 = (value14 >> 7) & 0x7F;
      w.writeUInt8(lsb14);
      w.writeUInt8(msb14);
    break;

    default:
      throw 'Unrecognized event type: ' + type
  }
  return eventTypeByte
}


function Writer() {
  this.buffer = [];
}

Writer.prototype.writeUInt8 = function(v) {
  this.buffer.push(v & 0xFF);
};
Writer.prototype.writeInt8 = Writer.prototype.writeUInt8;

Writer.prototype.writeUInt16 = function(v) {
  var b0 = (v >> 8) & 0xFF,
      b1 = v & 0xFF;

  this.writeUInt8(b0);
  this.writeUInt8(b1);
};
Writer.prototype.writeInt16 = Writer.prototype.writeUInt16;

Writer.prototype.writeUInt24 = function(v) {
  var b0 = (v >> 16) & 0xFF,
      b1 = (v >> 8) & 0xFF,
      b2 = v & 0xFF;

  this.writeUInt8(b0);
  this.writeUInt8(b1);
  this.writeUInt8(b2);
};
Writer.prototype.writeInt24 = Writer.prototype.writeUInt24;

Writer.prototype.writeUInt32 = function(v) {
  var b0 = (v >> 24) & 0xFF,
      b1 = (v >> 16) & 0xFF,
      b2 = (v >> 8) & 0xFF,
      b3 = v & 0xFF;

  this.writeUInt8(b0);
  this.writeUInt8(b1);
  this.writeUInt8(b2);
  this.writeUInt8(b3);
};
Writer.prototype.writeInt32 = Writer.prototype.writeUInt32;


Writer.prototype.writeBytes = function(arr) {
  this.buffer = this.buffer.concat(Array.prototype.slice.call(arr, 0));
};

Writer.prototype.writeString = function(str) {
  var i, len = str.length, arr = [];
  for (i=0; i < len; i++) {
    arr.push(str.codePointAt(i));
  }
  this.writeBytes(arr);
};

Writer.prototype.writeVarInt = function(v) {
  if (v < 0) throw "Cannot write negative variable-length integer"

  if (v <= 0x7F) {
    this.writeUInt8(v);
  } else {
    var i = v;
    var bytes = [];
    bytes.push(i & 0x7F);
    i >>= 7;
    while (i) {
      var b = i & 0x7F | 0x80;
      bytes.push(b);
      i >>= 7;
    }
    this.writeBytes(bytes.reverse());
  }
};

Writer.prototype.writeChunk = function(id, data) {
  this.writeString(id);
  this.writeUInt32(data.length);
  this.writeBytes(data);
};

var midiWriter = writeMidi;

var parseMidi$1 = midiParser;
var writeMidi$1 = midiWriter;

var midiFile = {
	parseMidi: parseMidi$1,
	writeMidi: writeMidi$1
};

var BinarySearch = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.insert = exports.search = void 0;
/**
 * Return the index of the element at or before the given property
 * @hidden
 */
function search(array, value, prop) {
    if (prop === void 0) { prop = "ticks"; }
    var beginning = 0;
    var len = array.length;
    var end = len;
    if (len > 0 && array[len - 1][prop] <= value) {
        return len - 1;
    }
    while (beginning < end) {
        // calculate the midpoint for roughly equal partition
        var midPoint = Math.floor(beginning + (end - beginning) / 2);
        var event_1 = array[midPoint];
        var nextEvent = array[midPoint + 1];
        if (event_1[prop] === value) {
            // choose the last one that has the same value
            for (var i = midPoint; i < array.length; i++) {
                var testEvent = array[i];
                if (testEvent[prop] === value) {
                    midPoint = i;
                }
            }
            return midPoint;
        }
        else if (event_1[prop] < value && nextEvent[prop] > value) {
            return midPoint;
        }
        else if (event_1[prop] > value) {
            // search lower
            end = midPoint;
        }
        else if (event_1[prop] < value) {
            // search upper
            beginning = midPoint + 1;
        }
    }
    return -1;
}
exports.search = search;
/**
 * Does a binary search to insert the note
 * in the correct spot in the array
 * @hidden
 */
function insert(array, event, prop) {
    if (prop === void 0) { prop = "ticks"; }
    if (array.length) {
        var index = search(array, event[prop], prop);
        array.splice(index + 1, 0, event);
    }
    else {
        array.push(event);
    }
}
exports.insert = insert;

});

var Header_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = exports.keySignatureKeys = void 0;

var privatePPQMap = new WeakMap();
/**
 * @hidden
 */
exports.keySignatureKeys = [
    "Cb",
    "Gb",
    "Db",
    "Ab",
    "Eb",
    "Bb",
    "F",
    "C",
    "G",
    "D",
    "A",
    "E",
    "B",
    "F#",
    "C#",
];
/**
 * The parsed MIDI file header.
 */
var Header = /** @class */ (function () {
    function Header(midiData) {
        var _this = this;
        /**
         * The array of all the tempo events.
         */
        this.tempos = [];
        /**
         * The time signatures.
         */
        this.timeSignatures = [];
        /**
         * The time signatures.
         */
        this.keySignatures = [];
        /**
         * Additional meta events.
         */
        this.meta = [];
        /**
         * The name of the MIDI file;
         */
        this.name = "";
        // Look through all the tracks for tempo changes.
        privatePPQMap.set(this, 480);
        if (midiData) {
            privatePPQMap.set(this, midiData.header.ticksPerBeat);
            // Check time signature and tempo events from all of the tracks.
            midiData.tracks.forEach(function (track) {
                track.forEach(function (event) {
                    if (event.meta) {
                        if (event.type === "timeSignature") {
                            _this.timeSignatures.push({
                                ticks: event.absoluteTime,
                                timeSignature: [
                                    event.numerator,
                                    event.denominator,
                                ],
                            });
                        }
                        else if (event.type === "setTempo") {
                            _this.tempos.push({
                                bpm: 60000000 / event.microsecondsPerBeat,
                                ticks: event.absoluteTime,
                            });
                        }
                        else if (event.type === "keySignature") {
                            _this.keySignatures.push({
                                key: exports.keySignatureKeys[event.key + 7],
                                scale: event.scale === 0 ? "major" : "minor",
                                ticks: event.absoluteTime,
                            });
                        }
                    }
                });
            });
            // Check the first track for other relevant data.
            var firstTrackCurrentTicks_1 = 0; // Used for absolute times.
            midiData.tracks[0].forEach(function (event) {
                firstTrackCurrentTicks_1 += event.deltaTime;
                if (event.meta) {
                    if (event.type === "trackName") {
                        _this.name = event.text;
                    }
                    else if (event.type === "text" ||
                        event.type === "cuePoint" ||
                        event.type === "marker" ||
                        event.type === "lyrics") {
                        _this.meta.push({
                            text: event.text,
                            ticks: firstTrackCurrentTicks_1,
                            type: event.type,
                        });
                    }
                }
            });
            this.update();
        }
    }
    /**
     * This must be invoked after any changes are made to the tempo array
     * or the timeSignature array for the updated values to be reflected.
     */
    Header.prototype.update = function () {
        var _this = this;
        var currentTime = 0;
        var lastEventBeats = 0;
        // Make sure it's sorted;
        this.tempos.sort(function (a, b) { return a.ticks - b.ticks; });
        this.tempos.forEach(function (event, index) {
            var lastBPM = index > 0 ? _this.tempos[index - 1].bpm : _this.tempos[0].bpm;
            var beats = event.ticks / _this.ppq - lastEventBeats;
            var elapsedSeconds = (60 / lastBPM) * beats;
            event.time = elapsedSeconds + currentTime;
            currentTime = event.time;
            lastEventBeats += beats;
        });
        this.timeSignatures.sort(function (a, b) { return a.ticks - b.ticks; });
        this.timeSignatures.forEach(function (event, index) {
            var lastEvent = index > 0
                ? _this.timeSignatures[index - 1]
                : _this.timeSignatures[0];
            var elapsedBeats = (event.ticks - lastEvent.ticks) / _this.ppq;
            var elapsedMeasures = elapsedBeats /
                lastEvent.timeSignature[0] /
                (lastEvent.timeSignature[1] / 4);
            lastEvent.measures = lastEvent.measures || 0;
            event.measures = elapsedMeasures + lastEvent.measures;
        });
    };
    /**
     * Convert ticks into seconds based on the tempo changes.
     */
    Header.prototype.ticksToSeconds = function (ticks) {
        // Find the relevant position.
        var index = (0, BinarySearch.search)(this.tempos, ticks);
        if (index !== -1) {
            var tempo = this.tempos[index];
            var tempoTime = tempo.time;
            var elapsedBeats = (ticks - tempo.ticks) / this.ppq;
            return tempoTime + (60 / tempo.bpm) * elapsedBeats;
        }
        else {
            // Assume 120.
            var beats = ticks / this.ppq;
            return (60 / 120) * beats;
        }
    };
    /**
     * Convert ticks into measures based off of the time signatures.
     */
    Header.prototype.ticksToMeasures = function (ticks) {
        var index = (0, BinarySearch.search)(this.timeSignatures, ticks);
        if (index !== -1) {
            var timeSigEvent = this.timeSignatures[index];
            var elapsedBeats = (ticks - timeSigEvent.ticks) / this.ppq;
            return (timeSigEvent.measures +
                elapsedBeats /
                    (timeSigEvent.timeSignature[0] /
                        timeSigEvent.timeSignature[1]) /
                    4);
        }
        else {
            return ticks / this.ppq / 4;
        }
    };
    Object.defineProperty(Header.prototype, "ppq", {
        /**
         * The number of ticks per quarter note.
         */
        get: function () {
            return privatePPQMap.get(this);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Convert seconds to ticks based on the tempo events.
     */
    Header.prototype.secondsToTicks = function (seconds) {
        // Find the relevant position.
        var index = (0, BinarySearch.search)(this.tempos, seconds, "time");
        if (index !== -1) {
            var tempo = this.tempos[index];
            var tempoTime = tempo.time;
            var elapsedTime = seconds - tempoTime;
            var elapsedBeats = elapsedTime / (60 / tempo.bpm);
            return Math.round(tempo.ticks + elapsedBeats * this.ppq);
        }
        else {
            // Assume 120.
            var beats = seconds / (60 / 120);
            return Math.round(beats * this.ppq);
        }
    };
    /**
     * Convert the header into an object.
     */
    Header.prototype.toJSON = function () {
        return {
            keySignatures: this.keySignatures,
            meta: this.meta,
            name: this.name,
            ppq: this.ppq,
            tempos: this.tempos.map(function (t) {
                return {
                    bpm: t.bpm,
                    ticks: t.ticks,
                };
            }),
            timeSignatures: this.timeSignatures,
        };
    };
    /**
     * Parse a header json object.
     */
    Header.prototype.fromJSON = function (json) {
        this.name = json.name;
        // Clone all the attributes.
        this.tempos = json.tempos.map(function (t) { return Object.assign({}, t); });
        this.timeSignatures = json.timeSignatures.map(function (t) {
            return Object.assign({}, t);
        });
        this.keySignatures = json.keySignatures.map(function (t) {
            return Object.assign({}, t);
        });
        this.meta = json.meta.map(function (t) { return Object.assign({}, t); });
        privatePPQMap.set(this, json.ppq);
        this.update();
    };
    /**
     * Update the tempo of the midi to a single tempo. Will remove and replace
     * any other tempos currently set and update all of the event timing.
     * @param bpm The tempo in beats per second.
     */
    Header.prototype.setTempo = function (bpm) {
        this.tempos = [
            {
                bpm: bpm,
                ticks: 0,
            },
        ];
        this.update();
    };
    return Header;
}());
exports.Header = Header;

});

var ControlChange_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlChange = exports.controlChangeIds = exports.controlChangeNames = void 0;
/**
 * A map of values to control change names
 * @hidden
 */
exports.controlChangeNames = {
    1: "modulationWheel",
    2: "breath",
    4: "footController",
    5: "portamentoTime",
    7: "volume",
    8: "balance",
    10: "pan",
    64: "sustain",
    65: "portamentoTime",
    66: "sostenuto",
    67: "softPedal",
    68: "legatoFootswitch",
    84: "portamentoControl",
};
/**
 * swap the keys and values
 * @hidden
 */
exports.controlChangeIds = Object.keys(exports.controlChangeNames).reduce(function (obj, key) {
    obj[exports.controlChangeNames[key]] = key;
    return obj;
}, {});
var privateHeaderMap = new WeakMap();
var privateCCNumberMap = new WeakMap();
/**
 * Represents a control change event
 */
var ControlChange = /** @class */ (function () {
    /**
     * @param event
     * @param header
     */
    function ControlChange(event, header) {
        privateHeaderMap.set(this, header);
        privateCCNumberMap.set(this, event.controllerType);
        this.ticks = event.absoluteTime;
        this.value = event.value;
    }
    Object.defineProperty(ControlChange.prototype, "number", {
        /**
         * The controller number
         */
        get: function () {
            return privateCCNumberMap.get(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ControlChange.prototype, "name", {
        /**
         * return the common name of the control number if it exists
         */
        get: function () {
            if (exports.controlChangeNames[this.number]) {
                return exports.controlChangeNames[this.number];
            }
            else {
                return null;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ControlChange.prototype, "time", {
        /**
         * The time of the event in seconds
         */
        get: function () {
            var header = privateHeaderMap.get(this);
            return header.ticksToSeconds(this.ticks);
        },
        set: function (t) {
            var header = privateHeaderMap.get(this);
            this.ticks = header.secondsToTicks(t);
        },
        enumerable: false,
        configurable: true
    });
    ControlChange.prototype.toJSON = function () {
        return {
            number: this.number,
            ticks: this.ticks,
            time: this.time,
            value: this.value,
        };
    };
    return ControlChange;
}());
exports.ControlChange = ControlChange;

});

var ControlChanges = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.createControlChanges = void 0;

/**
 * Automatically creates an alias for named control values using Proxies
 * @hidden
 */
function createControlChanges() {
    return new Proxy({}, {
        // tslint:disable-next-line: typedef
        get: function (target, handler) {
            if (target[handler]) {
                return target[handler];
            }
            else if (ControlChange_1.controlChangeIds.hasOwnProperty(handler)) {
                return target[ControlChange_1.controlChangeIds[handler]];
            }
        },
        // tslint:disable-next-line: typedef
        set: function (target, handler, value) {
            if (ControlChange_1.controlChangeIds.hasOwnProperty(handler)) {
                target[ControlChange_1.controlChangeIds[handler]] = value;
            }
            else {
                target[handler] = value;
            }
            return true;
        },
    });
}
exports.createControlChanges = createControlChanges;

});

var PitchBend_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.PitchBend = void 0;
var privateHeaderMap = new WeakMap();
/**
 * Represents a pitch bend event.
 */
var PitchBend = /** @class */ (function () {
    /**
     * @param event
     * @param header
     */
    function PitchBend(event, header) {
        privateHeaderMap.set(this, header);
        this.ticks = event.absoluteTime;
        this.value = event.value;
    }
    Object.defineProperty(PitchBend.prototype, "time", {
        /**
         * The time of the event in seconds
         */
        get: function () {
            var header = privateHeaderMap.get(this);
            return header.ticksToSeconds(this.ticks);
        },
        set: function (t) {
            var header = privateHeaderMap.get(this);
            this.ticks = header.secondsToTicks(t);
        },
        enumerable: false,
        configurable: true
    });
    PitchBend.prototype.toJSON = function () {
        return {
            ticks: this.ticks,
            time: this.time,
            value: this.value,
        };
    };
    return PitchBend;
}());
exports.PitchBend = PitchBend;

});

var InstrumentMaps = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrumKitByPatchID = exports.InstrumentFamilyByID = exports.instrumentByPatchID = void 0;
exports.instrumentByPatchID = [
    "acoustic grand piano",
    "bright acoustic piano",
    "electric grand piano",
    "honky-tonk piano",
    "electric piano 1",
    "electric piano 2",
    "harpsichord",
    "clavi",
    "celesta",
    "glockenspiel",
    "music box",
    "vibraphone",
    "marimba",
    "xylophone",
    "tubular bells",
    "dulcimer",
    "drawbar organ",
    "percussive organ",
    "rock organ",
    "church organ",
    "reed organ",
    "accordion",
    "harmonica",
    "tango accordion",
    "acoustic guitar (nylon)",
    "acoustic guitar (steel)",
    "electric guitar (jazz)",
    "electric guitar (clean)",
    "electric guitar (muted)",
    "overdriven guitar",
    "distortion guitar",
    "guitar harmonics",
    "acoustic bass",
    "electric bass (finger)",
    "electric bass (pick)",
    "fretless bass",
    "slap bass 1",
    "slap bass 2",
    "synth bass 1",
    "synth bass 2",
    "violin",
    "viola",
    "cello",
    "contrabass",
    "tremolo strings",
    "pizzicato strings",
    "orchestral harp",
    "timpani",
    "string ensemble 1",
    "string ensemble 2",
    "synthstrings 1",
    "synthstrings 2",
    "choir aahs",
    "voice oohs",
    "synth voice",
    "orchestra hit",
    "trumpet",
    "trombone",
    "tuba",
    "muted trumpet",
    "french horn",
    "brass section",
    "synthbrass 1",
    "synthbrass 2",
    "soprano sax",
    "alto sax",
    "tenor sax",
    "baritone sax",
    "oboe",
    "english horn",
    "bassoon",
    "clarinet",
    "piccolo",
    "flute",
    "recorder",
    "pan flute",
    "blown bottle",
    "shakuhachi",
    "whistle",
    "ocarina",
    "lead 1 (square)",
    "lead 2 (sawtooth)",
    "lead 3 (calliope)",
    "lead 4 (chiff)",
    "lead 5 (charang)",
    "lead 6 (voice)",
    "lead 7 (fifths)",
    "lead 8 (bass + lead)",
    "pad 1 (new age)",
    "pad 2 (warm)",
    "pad 3 (polysynth)",
    "pad 4 (choir)",
    "pad 5 (bowed)",
    "pad 6 (metallic)",
    "pad 7 (halo)",
    "pad 8 (sweep)",
    "fx 1 (rain)",
    "fx 2 (soundtrack)",
    "fx 3 (crystal)",
    "fx 4 (atmosphere)",
    "fx 5 (brightness)",
    "fx 6 (goblins)",
    "fx 7 (echoes)",
    "fx 8 (sci-fi)",
    "sitar",
    "banjo",
    "shamisen",
    "koto",
    "kalimba",
    "bag pipe",
    "fiddle",
    "shanai",
    "tinkle bell",
    "agogo",
    "steel drums",
    "woodblock",
    "taiko drum",
    "melodic tom",
    "synth drum",
    "reverse cymbal",
    "guitar fret noise",
    "breath noise",
    "seashore",
    "bird tweet",
    "telephone ring",
    "helicopter",
    "applause",
    "gunshot",
];
exports.InstrumentFamilyByID = [
    "piano",
    "chromatic percussion",
    "organ",
    "guitar",
    "bass",
    "strings",
    "ensemble",
    "brass",
    "reed",
    "pipe",
    "synth lead",
    "synth pad",
    "synth effects",
    "world",
    "percussive",
    "sound effects",
];
exports.DrumKitByPatchID = {
    0: "standard kit",
    8: "room kit",
    16: "power kit",
    24: "electronic kit",
    25: "tr-808 kit",
    32: "jazz kit",
    40: "brush kit",
    48: "orchestra kit",
    56: "sound fx kit",
};

});

var Instrument_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instrument = void 0;

/**
 * @hidden
 */
var privateTrackMap = new WeakMap();
/**
 * Describes the MIDI instrument of a track.
 */
var Instrument = /** @class */ (function () {
    /**
     * @param trackData
     * @param track
     */
    function Instrument(trackData, track) {
        /**
         * The instrument number. Defaults to 0.
         */
        this.number = 0;
        privateTrackMap.set(this, track);
        this.number = 0;
        if (trackData) {
            var programChange = trackData.find(function (e) { return e.type === "programChange"; });
            // Set 'number' from 'programNumber' if exists.
            if (programChange) {
                this.number = programChange.programNumber;
            }
        }
    }
    Object.defineProperty(Instrument.prototype, "name", {
        /**
         * The common name of the instrument.
         */
        get: function () {
            if (this.percussion) {
                return InstrumentMaps.DrumKitByPatchID[this.number];
            }
            else {
                return InstrumentMaps.instrumentByPatchID[this.number];
            }
        },
        set: function (n) {
            var patchNumber = InstrumentMaps.instrumentByPatchID.indexOf(n);
            if (patchNumber !== -1) {
                this.number = patchNumber;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Instrument.prototype, "family", {
        /**
         * The instrument family, e.g. "piano".
         */
        get: function () {
            if (this.percussion) {
                return "drums";
            }
            else {
                return InstrumentMaps.InstrumentFamilyByID[Math.floor(this.number / 8)];
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Instrument.prototype, "percussion", {
        /**
         * If the instrument is a percussion instrument.
         */
        get: function () {
            var track = privateTrackMap.get(this);
            return track.channel === 9;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Convert it to JSON form.
     */
    Instrument.prototype.toJSON = function () {
        return {
            family: this.family,
            number: this.number,
            name: this.name
        };
    };
    /**
     * Convert from JSON form.
     */
    Instrument.prototype.fromJSON = function (json) {
        this.number = json.number;
    };
    return Instrument;
}());
exports.Instrument = Instrument;

});

var Note_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
/**
 * Convert a MIDI note into a pitch.
 */
function midiToPitch(midi) {
    var octave = Math.floor(midi / 12) - 1;
    return midiToPitchClass(midi) + octave.toString();
}
/**
 * Convert a MIDI note to a pitch class (just the pitch no octave).
 */
function midiToPitchClass(midi) {
    var scaleIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    var note = midi % 12;
    return scaleIndexToNote[note];
}
/**
 * Convert a pitch class to a MIDI note.
 */
function pitchClassToMidi(pitch) {
    var scaleIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return scaleIndexToNote.indexOf(pitch);
}
/**
 * Convert a pitch to a MIDI number.
 */
// tslint:disable-next-line: only-arrow-functions typedef
var pitchToMidi = (function () {
    var regexp = /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i;
    var noteToScaleIndex = {
        // tslint:disable-next-line: object-literal-sort-keys
        cbb: -2, cb: -1, c: 0, "c#": 1, cx: 2,
        dbb: 0, db: 1, d: 2, "d#": 3, dx: 4,
        ebb: 2, eb: 3, e: 4, "e#": 5, ex: 6,
        fbb: 3, fb: 4, f: 5, "f#": 6, fx: 7,
        gbb: 5, gb: 6, g: 7, "g#": 8, gx: 9,
        abb: 7, ab: 8, a: 9, "a#": 10, ax: 11,
        bbb: 9, bb: 10, b: 11, "b#": 12, bx: 13,
    };
    return function (note) {
        var split = regexp.exec(note);
        var pitch = split[1];
        var octave = split[2];
        var index = noteToScaleIndex[pitch.toLowerCase()];
        return index + (parseInt(octave, 10) + 1) * 12;
    };
}());
var privateHeaderMap = new WeakMap();
/**
 * A Note consists of a `noteOn` and `noteOff` event.
 */
var Note = /** @class */ (function () {
    function Note(noteOn, noteOff, header) {
        privateHeaderMap.set(this, header);
        this.midi = noteOn.midi;
        this.velocity = noteOn.velocity;
        this.noteOffVelocity = noteOff.velocity;
        this.ticks = noteOn.ticks;
        this.durationTicks = noteOff.ticks - noteOn.ticks;
    }
    Object.defineProperty(Note.prototype, "name", {
        /**
         * The note name and octave in scientific pitch notation, e.g. "C4".
         */
        get: function () {
            return midiToPitch(this.midi);
        },
        set: function (n) {
            this.midi = pitchToMidi(n);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Note.prototype, "octave", {
        /**
         * The notes octave number.
         */
        get: function () {
            return Math.floor(this.midi / 12) - 1;
        },
        set: function (o) {
            var diff = o - this.octave;
            this.midi += diff * 12;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Note.prototype, "pitch", {
        /**
         * The pitch class name. e.g. "A".
         */
        get: function () {
            return midiToPitchClass(this.midi);
        },
        set: function (p) {
            this.midi = 12 * (this.octave + 1) + pitchClassToMidi(p);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Note.prototype, "duration", {
        /**
         * The duration of the segment in seconds.
         */
        get: function () {
            var header = privateHeaderMap.get(this);
            return header.ticksToSeconds(this.ticks + this.durationTicks) - header.ticksToSeconds(this.ticks);
        },
        set: function (d) {
            var header = privateHeaderMap.get(this);
            var noteEndTicks = header.secondsToTicks(this.time + d);
            this.durationTicks = noteEndTicks - this.ticks;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Note.prototype, "time", {
        /**
         * The time of the event in seconds.
         */
        get: function () {
            var header = privateHeaderMap.get(this);
            return header.ticksToSeconds(this.ticks);
        },
        set: function (t) {
            var header = privateHeaderMap.get(this);
            this.ticks = header.secondsToTicks(t);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Note.prototype, "bars", {
        /**
         * The number of measures (and partial measures) to this beat.
         * Takes into account time signature changes.
         * @readonly
         */
        get: function () {
            var header = privateHeaderMap.get(this);
            return header.ticksToMeasures(this.ticks);
        },
        enumerable: false,
        configurable: true
    });
    Note.prototype.toJSON = function () {
        return {
            duration: this.duration,
            durationTicks: this.durationTicks,
            midi: this.midi,
            name: this.name,
            ticks: this.ticks,
            time: this.time,
            velocity: this.velocity,
        };
    };
    return Note;
}());
exports.Note = Note;

});

var Track_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = void 0;






var privateHeaderMap = new WeakMap();
/**
 * A Track is a collection of 'notes' and 'controlChanges'.
 */
var Track = /** @class */ (function () {
    function Track(trackData, header) {
        var _this = this;
        /**
         * The name of the track.
         */
        this.name = "";
        /**
         * The track's note events.
         */
        this.notes = [];
        /**
         * The control change events.
         */
        this.controlChanges = (0, ControlChanges.createControlChanges)();
        /**
         * The pitch bend events.
         */
        this.pitchBends = [];
        privateHeaderMap.set(this, header);
        if (trackData) {
            // Get the name of the track.
            var nameEvent = trackData.find(function (e) { return e.type === "trackName"; });
            // Set empty name if 'trackName' event isn't found.
            this.name = nameEvent ? nameEvent.text : "";
        }
        this.instrument = new Instrument_1.Instrument(trackData, this);
        // Defaults to 0.
        this.channel = 0;
        if (trackData) {
            var noteOns = trackData.filter(function (event) { return event.type === "noteOn"; });
            var noteOffs = trackData.filter(function (event) { return event.type === "noteOff"; });
            var _loop_1 = function () {
                var currentNote = noteOns.shift();
                // Set the channel based on the note.
                this_1.channel = currentNote.channel;
                // Find the corresponding note off.
                var offIndex = noteOffs.findIndex(function (note) {
                    return note.noteNumber === currentNote.noteNumber &&
                        note.absoluteTime >= currentNote.absoluteTime;
                });
                if (offIndex !== -1) {
                    // Once it's got the note off, add it.
                    var noteOff = noteOffs.splice(offIndex, 1)[0];
                    this_1.addNote({
                        durationTicks: noteOff.absoluteTime - currentNote.absoluteTime,
                        midi: currentNote.noteNumber,
                        noteOffVelocity: noteOff.velocity / 127,
                        ticks: currentNote.absoluteTime,
                        velocity: currentNote.velocity / 127,
                    });
                }
            };
            var this_1 = this;
            while (noteOns.length) {
                _loop_1();
            }
            var controlChanges = trackData.filter(function (event) { return event.type === "controller"; });
            controlChanges.forEach(function (event) {
                _this.addCC({
                    number: event.controllerType,
                    ticks: event.absoluteTime,
                    value: event.value / 127,
                });
            });
            var pitchBends = trackData.filter(function (event) { return event.type === "pitchBend"; });
            pitchBends.forEach(function (event) {
                _this.addPitchBend({
                    ticks: event.absoluteTime,
                    // Scale the value between -2^13 to 2^13 to -2 to 2.
                    value: event.value / Math.pow(2, 13),
                });
            });
            var endOfTrackEvent = trackData.find(function (event) {
                return event.type === "endOfTrack";
            });
            this.endOfTrackTicks =
                endOfTrackEvent !== undefined
                    ? endOfTrackEvent.absoluteTime
                    : undefined;
        }
    }
    /**
     * Add a note to the notes array.
     * @param props The note properties to add.
     */
    Track.prototype.addNote = function (props) {
        var header = privateHeaderMap.get(this);
        var note = new Note_1.Note({
            midi: 0,
            ticks: 0,
            velocity: 1,
        }, {
            ticks: 0,
            velocity: 0,
        }, header);
        Object.assign(note, props);
        (0, BinarySearch.insert)(this.notes, note, "ticks");
        return this;
    };
    /**
     * Add a control change to the track.
     * @param props
     */
    Track.prototype.addCC = function (props) {
        var header = privateHeaderMap.get(this);
        var cc = new ControlChange_1.ControlChange({
            controllerType: props.number,
        }, header);
        delete props.number;
        Object.assign(cc, props);
        if (!Array.isArray(this.controlChanges[cc.number])) {
            this.controlChanges[cc.number] = [];
        }
        (0, BinarySearch.insert)(this.controlChanges[cc.number], cc, "ticks");
        return this;
    };
    /**
     * Add a control change to the track.
     */
    Track.prototype.addPitchBend = function (props) {
        var header = privateHeaderMap.get(this);
        var pb = new PitchBend_1.PitchBend({}, header);
        Object.assign(pb, props);
        (0, BinarySearch.insert)(this.pitchBends, pb, "ticks");
        return this;
    };
    Object.defineProperty(Track.prototype, "duration", {
        /**
         * The end time of the last event in the track.
         */
        get: function () {
            if (!this.notes.length) {
                return 0;
            }
            var maxDuration = this.notes[this.notes.length - 1].time +
                this.notes[this.notes.length - 1].duration;
            for (var i = 0; i < this.notes.length - 1; i++) {
                var duration = this.notes[i].time + this.notes[i].duration;
                if (maxDuration < duration) {
                    maxDuration = duration;
                }
            }
            return maxDuration;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Track.prototype, "durationTicks", {
        /**
         * The end time of the last event in the track in ticks.
         */
        get: function () {
            if (!this.notes.length) {
                return 0;
            }
            var maxDuration = this.notes[this.notes.length - 1].ticks +
                this.notes[this.notes.length - 1].durationTicks;
            for (var i = 0; i < this.notes.length - 1; i++) {
                var duration = this.notes[i].ticks + this.notes[i].durationTicks;
                if (maxDuration < duration) {
                    maxDuration = duration;
                }
            }
            return maxDuration;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Assign the JSON values to this track.
     */
    Track.prototype.fromJSON = function (json) {
        var _this = this;
        this.name = json.name;
        this.channel = json.channel;
        this.instrument = new Instrument_1.Instrument(undefined, this);
        this.instrument.fromJSON(json.instrument);
        if (json.endOfTrackTicks !== undefined) {
            this.endOfTrackTicks = json.endOfTrackTicks;
        }
        for (var number in json.controlChanges) {
            if (json.controlChanges[number]) {
                json.controlChanges[number].forEach(function (cc) {
                    _this.addCC({
                        number: cc.number,
                        ticks: cc.ticks,
                        value: cc.value,
                    });
                });
            }
        }
        json.notes.forEach(function (n) {
            _this.addNote({
                durationTicks: n.durationTicks,
                midi: n.midi,
                ticks: n.ticks,
                velocity: n.velocity,
            });
        });
    };
    /**
     * Convert the track into a JSON format.
     */
    Track.prototype.toJSON = function () {
        // Convert all the CCs to JSON.
        var controlChanges = {};
        for (var i = 0; i < 127; i++) {
            if (this.controlChanges.hasOwnProperty(i)) {
                controlChanges[i] = this.controlChanges[i].map(function (c) {
                    return c.toJSON();
                });
            }
        }
        var json = {
            channel: this.channel,
            controlChanges: controlChanges,
            pitchBends: this.pitchBends.map(function (pb) { return pb.toJSON(); }),
            instrument: this.instrument.toJSON(),
            name: this.name,
            notes: this.notes.map(function (n) { return n.toJSON(); }),
        };
        if (this.endOfTrackTicks !== undefined) {
            json.endOfTrackTicks = this.endOfTrackTicks;
        }
        return json;
    };
    return Track;
}());
exports.Track = Track;

});

/**
 * Flatten an array indefinitely.
 */
function flatten(array) {
    var result = [];
    $flatten(array, result);
    return result;
}
/**
 * Internal flatten function recursively passes `result`.
 */
function $flatten(array, result) {
    for (var i = 0; i < array.length; i++) {
        var value = array[i];
        if (Array.isArray(value)) {
            $flatten(value, result);
        }
        else {
            result.push(value);
        }
    }
}

var dist_es2015 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  flatten: flatten
});

var Encode = createCommonjsModule(function (module, exports) {
var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = void 0;



function encodeNote(note, channel) {
    return [{
            absoluteTime: note.ticks,
            channel: channel,
            deltaTime: 0,
            noteNumber: note.midi,
            type: "noteOn",
            velocity: Math.floor(note.velocity * 127),
        },
        {
            absoluteTime: note.ticks + note.durationTicks,
            channel: channel,
            deltaTime: 0,
            noteNumber: note.midi,
            type: "noteOff",
            velocity: Math.floor(note.noteOffVelocity * 127),
        }];
}
function encodeNotes(track) {
    return (0, dist_es2015.flatten)(track.notes.map(function (note) { return encodeNote(note, track.channel); }));
}
function encodeControlChange(cc, channel) {
    return {
        absoluteTime: cc.ticks,
        channel: channel,
        controllerType: cc.number,
        deltaTime: 0,
        type: "controller",
        value: Math.floor(cc.value * 127),
    };
}
function encodeControlChanges(track) {
    var controlChanges = [];
    for (var i = 0; i < 127; i++) {
        if (track.controlChanges.hasOwnProperty(i)) {
            track.controlChanges[i].forEach(function (cc) {
                controlChanges.push(encodeControlChange(cc, track.channel));
            });
        }
    }
    return controlChanges;
}
function encodePitchBend(pb, channel) {
    return {
        absoluteTime: pb.ticks,
        channel: channel,
        deltaTime: 0,
        type: "pitchBend",
        value: pb.value,
    };
}
function encodePitchBends(track) {
    var pitchBends = [];
    track.pitchBends.forEach(function (pb) {
        pitchBends.push(encodePitchBend(pb, track.channel));
    });
    return pitchBends;
}
function encodeInstrument(track) {
    return {
        absoluteTime: 0,
        channel: track.channel,
        deltaTime: 0,
        programNumber: track.instrument.number,
        type: "programChange",
    };
}
function encodeTrackName(name) {
    return {
        absoluteTime: 0,
        deltaTime: 0,
        meta: true,
        text: name,
        type: "trackName",
    };
}
function encodeTempo(tempo) {
    return {
        absoluteTime: tempo.ticks,
        deltaTime: 0,
        meta: true,
        microsecondsPerBeat: Math.floor(60000000 / tempo.bpm),
        type: "setTempo",
    };
}
function encodeTimeSignature(timeSig) {
    return {
        absoluteTime: timeSig.ticks,
        deltaTime: 0,
        denominator: timeSig.timeSignature[1],
        meta: true,
        metronome: 24,
        numerator: timeSig.timeSignature[0],
        thirtyseconds: 8,
        type: "timeSignature",
    };
}
// function encodeMeta(event: )
function encodeKeySignature(keySig) {
    var keyIndex = Header_1.keySignatureKeys.indexOf(keySig.key);
    return {
        absoluteTime: keySig.ticks,
        deltaTime: 0,
        key: keyIndex + 7,
        meta: true,
        scale: keySig.scale === "major" ? 0 : 1,
        type: "keySignature",
    };
}
function encodeText(textEvent) {
    return {
        absoluteTime: textEvent.ticks,
        deltaTime: 0,
        meta: true,
        text: textEvent.text,
        type: textEvent.type,
    };
}
/**
 * Convert the MIDI object to an array.
 */
function encode(midi) {
    var midiData = {
        header: {
            format: 1,
            numTracks: midi.tracks.length + 1,
            ticksPerBeat: midi.header.ppq,
        },
        tracks: __spreadArray([
            __spreadArray(__spreadArray(__spreadArray(__spreadArray([
                // The name data.
                {
                    absoluteTime: 0,
                    deltaTime: 0,
                    meta: true,
                    text: midi.header.name,
                    type: "trackName",
                }
            ], midi.header.keySignatures.map(function (keySig) { return encodeKeySignature(keySig); }), true), midi.header.meta.map(function (e) { return encodeText(e); }), true), midi.header.tempos.map(function (tempo) { return encodeTempo(tempo); }), true), midi.header.timeSignatures.map(function (timeSig) { return encodeTimeSignature(timeSig); }), true)
        ], midi.tracks.map(function (track) {
            return __spreadArray(__spreadArray(__spreadArray([
                // Add the name
                encodeTrackName(track.name),
                // the instrument
                encodeInstrument(track)
            ], encodeNotes(track), true), encodeControlChanges(track), true), encodePitchBends(track), true);
        }), true),
    };
    // Sort and set `deltaTime` of all of the tracks.
    midiData.tracks = midiData.tracks.map(function (track) {
        track = track.sort(function (a, b) { return a.absoluteTime - b.absoluteTime; });
        var lastTime = 0;
        track.forEach(function (note) {
            note.deltaTime = note.absoluteTime - lastTime;
            lastTime = note.absoluteTime;
            delete note.absoluteTime;
        });
        // End of track.
        track.push({
            deltaTime: 0,
            meta: true,
            type: "endOfTrack",
        });
        return track;
    });
    // Rreturn `midiData`.
    return new Uint8Array((0, midiFile.writeMidi)(midiData));
}
exports.encode = encode;

});

var Midi_1 = createCommonjsModule(function (module, exports) {
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (commonjsGlobal && commonjsGlobal.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = exports.Track = exports.Midi = void 0;




/**
 * The main midi parsing class.
 */
var Midi = /** @class */ (function () {
    /**
     * Parse the midi data
     */
    function Midi(midiArray) {
        var _this = this;
        // Parse the MIDI data if there is any.
        var midiData = null;
        if (midiArray) {
            // Transform midiArray to ArrayLike<number>
            // only if it's an ArrayBuffer.
            var midiArrayLike = midiArray instanceof ArrayBuffer
                ? new Uint8Array(midiArray)
                : midiArray;
            // Parse MIDI data.
            midiData = (0, midiFile.parseMidi)(midiArrayLike);
            // Add the absolute times to each of the tracks.
            midiData.tracks.forEach(function (track) {
                var currentTicks = 0;
                track.forEach(function (event) {
                    currentTicks += event.deltaTime;
                    event.absoluteTime = currentTicks;
                });
            });
            // Ensure at most one instrument per track.
            midiData.tracks = splitTracks(midiData.tracks);
        }
        this.header = new Header_1.Header(midiData);
        this.tracks = [];
        // Parse MIDI data.
        if (midiArray) {
            // Format 0, everything is on the same track.
            this.tracks = midiData.tracks.map(function (trackData) { return new Track_1.Track(trackData, _this.header); });
            // If it's format 1 and there are no notes on the first track, remove it.
            if (midiData.header.format === 1 && this.tracks[0].duration === 0) {
                this.tracks.shift();
            }
        }
    }
    /**
     * Download and parse the MIDI file. Returns a promise
     * which resolves to the generated MIDI file.
     * @param url The URL to fetch.
     */
    Midi.fromUrl = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, arrayBuffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 2:
                        arrayBuffer = _a.sent();
                        return [2 /*return*/, new Midi(arrayBuffer)];
                    case 3: throw new Error("Could not load '".concat(url, "'"));
                }
            });
        });
    };
    Object.defineProperty(Midi.prototype, "name", {
        /**
         * The name of the midi file, taken from the first track.
         */
        get: function () {
            return this.header.name;
        },
        set: function (n) {
            this.header.name = n;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Midi.prototype, "duration", {
        /**
         * The total length of the file in seconds.
         */
        get: function () {
            // Get the max of the last note of all the tracks.
            var durations = this.tracks.map(function (t) { return t.duration; });
            return Math.max.apply(Math, durations);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Midi.prototype, "durationTicks", {
        /**
         * The total length of the file in ticks.
         */
        get: function () {
            // Get the max of the last note of all the tracks.
            var durationTicks = this.tracks.map(function (t) { return t.durationTicks; });
            return Math.max.apply(Math, durationTicks);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add a track to the MIDI file.
     */
    Midi.prototype.addTrack = function () {
        var track = new Track_1.Track(undefined, this.header);
        this.tracks.push(track);
        return track;
    };
    /**
     * Encode the MIDI as a Uint8Array.
     */
    Midi.prototype.toArray = function () {
        return (0, Encode.encode)(this);
    };
    /**
     * Convert the MIDI object to JSON.
     */
    Midi.prototype.toJSON = function () {
        return {
            header: this.header.toJSON(),
            tracks: this.tracks.map(function (track) { return track.toJSON(); }),
        };
    };
    /**
     * Parse a JSON representation of the object. Will overwrite the current
     * tracks and header.
     */
    Midi.prototype.fromJSON = function (json) {
        var _this = this;
        this.header = new Header_1.Header();
        this.header.fromJSON(json.header);
        this.tracks = json.tracks.map(function (trackJSON) {
            var track = new Track_1.Track(undefined, _this.header);
            track.fromJSON(trackJSON);
            return track;
        });
    };
    /**
     * Clone the entire object MIDI object.
     */
    Midi.prototype.clone = function () {
        var midi = new Midi();
        midi.fromJSON(this.toJSON());
        return midi;
    };
    return Midi;
}());
exports.Midi = Midi;
var Track_2 = Track_1;
Object.defineProperty(exports, "Track", { enumerable: true, get: function () { return Track_2.Track; } });
var Header_2 = Header_1;
Object.defineProperty(exports, "Header", { enumerable: true, get: function () { return Header_2.Header; } });
/**
 * Given a list of MIDI tracks, make sure that each channel corresponds to at
 * most one channel and at most one instrument. This means splitting up tracks
 * that contain more than one channel or instrument.
 */
function splitTracks(tracks) {
    var newTracks = [];
    for (var i = 0; i < tracks.length; i++) {
        var defaultTrack = newTracks.length;
        // a map from [program, channel] tuples to new track numbers
        var trackMap = new Map();
        // a map from channel numbers to current program numbers
        var currentProgram = Array(16).fill(0);
        for (var _i = 0, _a = tracks[i]; _i < _a.length; _i++) {
            var event_1 = _a[_i];
            var targetTrack = defaultTrack;
            // If the event has a channel, we need to find that channel's current
            // program number and the appropriate track for this [program, channel]
            // pair.
            var channel = event_1.channel;
            if (channel !== undefined) {
                if (event_1.type === "programChange") {
                    currentProgram[channel] = event_1.programNumber;
                }
                var program = currentProgram[channel];
                var trackKey = "".concat(program, " ").concat(channel);
                if (trackMap.has(trackKey)) {
                    targetTrack = trackMap.get(trackKey);
                }
                else {
                    targetTrack = defaultTrack + trackMap.size;
                    trackMap.set(trackKey, targetTrack);
                }
            }
            if (!newTracks[targetTrack]) {
                newTracks.push([]);
            }
            newTracks[targetTrack].push(event_1);
        }
    }
    return newTracks;
}

});

var __pika_web_default_export_for_treeshaking__ = /*@__PURE__*/getDefaultExportFromCjs(Midi_1);

var Header = Midi_1.Header;
var Midi = Midi_1.Midi;
var Track = Midi_1.Track;
export default __pika_web_default_export_for_treeshaking__;
export { Header, Midi, Track, Midi_1 as __moduleExports };

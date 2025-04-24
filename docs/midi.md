# MIDI

MusicBoxFun supports import / export to MIDI.

This conversion was fairly custom so I wanted to capture some of the decisions here.

## Importing MIDI

Mechanical music boxes are highly constrained devices. They have a single "track", a limited set of pitches, and speed limitations. As such, many imported MIDI files cannot be imported exactly. In order to support importing, we make the following compromises:
- Any tracks using "percussive" or "sound effect" instruments are dropped.
- All remaining tracks are merged into a single "music box" track, and duplicate notes are dropped.
- Any notes with pitches that aren't supported by the currently selected music box type are dropped.
- If the tempo exceeds the music box's MAX_TEMPO (currently 180bpm), the tempo is adjusted to MAX_TEMPO.

For the sake of simplicity (and song integrity), we do NOT attempt to automatically transpose notes or adjust the box type in order to improve the "fit" of the import. If a song doesn't fit the music box type, users can change the box type and reimport. Song adjustments can also be made in a separate MIDI editor tool.

## Exporting to MIDI

The MusicBoxFun interface is designed to mirror the paper punch experience, not a typical MIDI editor. As such, we make a few adjustments when producing a MIDI export:
- The "starting gap" at the top of the music box paper is removed. This ensures that exported midi files align with standard MIDI editor grids and don't have a weird gap at the beginning. Any notes found in the starting gap during export are shifted to tick 0. This changes the song slightly (usually a no-no) but I accept it because songs with starting gap notes are uncommon, and I'd rather compromise an uncommon song than a common song.
- Silent notes are included in the export. Typically, we ignore silent notes to maximize fidelity with mechanical music boxes, but we make an exception here because MIDI exports are not part of the mechanical music box paradigm. Also, including silent notes allows those notes to be adjusted in external tools, which could be helpful for fixing silent note gaps.

## Timing Details

MIDI songs are measured in ticks. Ticks, like "quarter notes" are relative to the tempo. That said, the number of ticks in a quarter note is adjustable and is defined in the MIDI file. This configuration is sometimes called "Pulses Per Quarter note" (PPQ). MIDI editors can use various values for PPQ, so our import function is set up to convert between them. Here are some PPQ values I found in common MIDI exports:

- MusicBoxFun PPQ: 192
- Beepbox PPQ: 96
- MusicBoxManiacs: 960
- OnlineSequencer PPQ: 384

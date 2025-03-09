/// <reference types="cypress" />

import { Midi } from '../../public/js/vendor/@tonejs/midi.js';

describe('MIDI export', () => {
  const fileSelectSelector = '[data-testid="file-select"]';

  beforeEach(() => {
    // Clear downloads folder before each test
    cy.exec('rm -f cypress/downloads/*', { log: true, failOnNonZeroExit: false });
  });

  it('should export a song with correct MIDI content', () => {
    cy.visit('/');

    // Set song title
    const songTitle = 'MIDI Content Test';
    cy.get('#song-title input').clear().type(songTitle);

    // Set a specific tempo
    const customTempo = '90';
    cy.get('#tempo-field input').clear().type(customTempo);

    // Add specific notes
    cy.get('#C5').click(5, 16);  // Note 1: C5 at position 16
    cy.get('#E5').click(5, 40);  // Note 2: E5 at position 40
    cy.get('#C5').click(5, 40);  // Silent note: C5 at position 40 (should be ignored in MIDI)

    // Export the song to MIDI
    cy.get(fileSelectSelector).select('export-midi');

    // Verify the file was downloaded
    cy.readFile(`cypress/downloads/MIDI_Content_Test.mid`, 'binary', { timeout: 15000 })
      .should('exist')
      .then(buffer => {
        // Convert binary string to Uint8Array for MIDI parser
        const uint8Array = new Uint8Array(buffer.length);
        for (let i = 0; i < buffer.length; i++) {
          uint8Array[i] = buffer.charCodeAt(i);
        }

        // Parse the MIDI file
        const midi = new Midi(uint8Array);

        // Verify the basic MIDI properties
        expect(midi.name).to.equal(songTitle);
        expect(midi.header.tempos[0].bpm).to.be.closeTo(Number(customTempo), 0.001);

        // Verify the track
        expect(midi.tracks).to.have.length(1);
        expect(midi.tracks[0].notes).to.have.length(2); // Only 2 notes, silent note excluded

        // Verify the specific notes
        const notes = midi.tracks[0].notes;
        expect(notes[0].name).to.include('C5');
        expect(notes[1].name).to.include('E5');

        // Verify relative timing of notes (should correspond to their Y positions)
        expect(notes[1].time).to.be.greaterThan(notes[0].time);

        // Verify the timing in ticks
        const TICKS_PER_PIXEL = 4;
        const expectedTicks = [
          16 * TICKS_PER_PIXEL, // C5 at yPos 16
          40 * TICKS_PER_PIXEL, // E5 at yPos 40
        ];

        expect(notes[0].ticks).to.equal(expectedTicks[0]);
        expect(notes[1].ticks).to.equal(expectedTicks[1]);
      });
  });
});

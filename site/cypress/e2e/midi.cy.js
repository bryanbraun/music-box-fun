/// <reference types="cypress" />

import { Midi } from '../../public/js/vendor/@tonejs/midi.js';

const fileUploadSelector = '#file-dropdown input[type="file"]';

describe('MIDI export', () => {
  it('should export a song with correct MIDI content', () => {
    // Initial song
    //   Box type: 15
    //   Title: "MIDI Content Test"
    //   Tempo: 90
    //   Notes:
    //    G4: [8], (8 should be shifted to 16 because it is in the NOTE_LINE_STARTING_GAP)
    //    C5: [16, 40], (40 is silent)
    //    E5: [40]
    cy.visit('/#1XQAAAAJMAAAAAAAAAABBqEgrEn85P544Pg18ZR5V7leb0PO4nKjjJCWqJvSndRoZiLMKMOOUkT0p4n2E_X8l3A7l9Sm31RK4zD-5XCQBkuHC3ACyNV__tmTAAA');

    // Export the song to MIDI
    cy.get('#file-dropdown__menu').click();
    cy.get('[data-action="export-midi"').click();

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
        expect(midi.name).to.equal("MIDI Content Test");
        expect(midi.header.tempos[0].bpm).to.be.closeTo(90, 0.001);

        // Verify the track
        expect(midi.tracks).to.have.length(1);
        expect(midi.tracks[0].notes).to.have.length(4);

        // Verify the specific notes
        const notes = midi.tracks[0].notes;
        expect(notes[0].name).to.include('G4');
        expect(notes[1].name).to.include('C5');
        expect(notes[2].name).to.include('C5');
        expect(notes[3].name).to.include('E5');

        // Verify relative timing of notes (should correspond to their Y positions)
        expect(notes[3].time).to.be.greaterThan(notes[1].time);

        // Verify the timing in ticks
        const expectedTicks = [
          0, // G4 at start (shifted out of NOTE_LINE_STARTING_GAP)
          0, // C5 at start
          96, // C5 at 1 eighth note after start (PPQ is 192)
          96, // E5 also at 1 eighth note after start (PPQ is 192)
        ];

        expect(notes[0].ticks).to.equal(expectedTicks[0]);
        expect(notes[1].ticks).to.equal(expectedTicks[1]);
        expect(notes[2].ticks).to.equal(expectedTicks[2]);
        expect(notes[3].ticks).to.equal(expectedTicks[3]);
      });
  });
});

describe('MIDI import', () => {
  describe('confirmation dialog', () => {
    it("launches when an existing song would be overwritten, and aborts when cancelled", () => {
      // Initial song
      //   Box type: 15
      //   Title: My song
      //   Notes: C5
      cy.visit('/#1XQAAAAI_AAAAAAAAAABBqEgqcoALRWwLOd00pF2TL7o7j4-0NnyAGw4bIHH2OklQMusoZrHu-lHqFfYGhBguZjO8ozhHSQj__-qwYAA', {
        onBeforeLoad(windowObj) {
          cy.stub(windowObj, 'confirm').returns(false);
        }
      });

      cy.get('#file-dropdown__menu').click();
      cy.get('[data-action="import-midi"').click();

      cy.window().its('confirm').should('be.called');

      cy.get('#song-title input').should('have.value', 'My song');
      cy.get('#note-lines .hole').should('have.length', 1);
    });

    it("doesn't launch when there is no existing song data to overwrite", () => {
      cy.visit('/', {
        onBeforeLoad(windowObj) {
          cy.stub(windowObj, 'confirm').returns(false);
        }
      });

      cy.get('#file-dropdown__menu').click();
      cy.get('[data-action="import-midi"').click();

      cy.window().its('confirm').should('not.be.called');
    });

  });

  it("successfully imports a MIDI file", () => {
    cy.visit('/', {
      onBeforeLoad(windowObj) {
        cy.stub(windowObj, 'alert');
      }
    });

    cy.get(fileUploadSelector).selectFile('cypress/fixtures/valid-test-import.mid', { force: true });

    // MIDI file notes:
    //  "sound effects": C4 (should be omitted because it's a sound effect)
    //  "percussive": C6 (should be omitted because it's percussive)
    //  "music box": D#3 (should be omitted because it's out of range), C5, E5 (should be imported)
    //  "piano": C5, (should be omitted because it duplicates an existing C5), G5 (should be imported)
    //  Total expected notes: 3
    cy.get('#note-lines .hole').should('have.length', 3);

    // Confirm successful PPQ conversion via note locations (converting PPQ of 96 to 192).
    cy.get('#C5 .hole').first().should('have.attr', 'style', 'transform: translateY(16px)');
    cy.get('#E5 .hole').first().should('have.attr', 'style', 'transform: translateY(40px)');
    cy.get('#G5 .hole').first().should('have.attr', 'style', 'transform: translateY(40px)');

    cy.get('#song-title input').should('have.value', 'Imported song');
    cy.get('#tempo-field input').should('have.value', '123');

    cy.window().its('alert').should('be.calledWithMatch', 'Some notes could not be imported');
  });

  it("displays an error alert when the MIDI file is invalid", () => {
    cy.visit('/', {
      onBeforeLoad(windowObj) {
        cy.stub(windowObj, 'alert');
      }
    });

    cy.get(fileUploadSelector).selectFile('cypress/fixtures/invalid-test-import.mid', { force: true });

    cy.window().its('alert').should('be.calledWithMatch', 'An error occurred and the MIDI file could not be imported.');
  });
});

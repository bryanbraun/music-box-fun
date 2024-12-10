/// <reference types="cypress" />

describe('Song edits', () => {
  const musicBoxTypeSelector = '[data-testid="music-box-type-select"]';
  const songUpdatedSelector = '#song-updated-message';
  const dividersSelector = '[data-testid="divider"]';
  const snapToSelector = '#snap-to select';

  it('should store data in the URL', () => {
    cy.visit('/');

    // Selectors
    const songTitleSelector = '#song-title input';
    const tempoFieldSelector = '#tempo-field input';

    // Song Content
    const newSongTitle = 'Example Song Title';
    const newBoxTypeValue = '20';
    const newTempo = '120';
    const newNoteYPos = 64;

    // Make edits one-by-one and compare the URL after each step. To do this, we
    // have to nest the statements. We cannot use async/await, because Cypress's
    // "then" isn't the same as a typical promise. For more details, see:
    // https://docs.cypress.io/guides/core-concepts/variables-and-aliases.html#Closures
    cy.url().then(url1 => {
      cy.get(songTitleSelector).type(newSongTitle)
      cy.url().should('not.eq', url1);
      cy.get(songUpdatedSelector).should('be.visible');

      cy.url().then(url2 => {
        cy.get(musicBoxTypeSelector).select(newBoxTypeValue);
        cy.url().should('not.eq', url2);
        cy.get(songUpdatedSelector).should('be.visible');

        cy.url().then(url3 => {
          cy.get(tempoFieldSelector).clear().type(newTempo);
          cy.url().should('not.eq', url3);
          cy.get(songUpdatedSelector).should('be.visible');

          cy.url().then(url4 => {
            cy.get('#C5').click(6, newNoteYPos); // left: 6px, top: 64px
            cy.url().should('not.eq', url4);
            cy.get(songUpdatedSelector).should('be.visible');
          });
        });
      });
    });

    cy.reload(); // Reload and verify that the edits all remain.

    cy.get(songTitleSelector)
      .should('have.value', newSongTitle);

    cy.get(musicBoxTypeSelector).find(':selected')
      .should('have.value', newBoxTypeValue);

    cy.get(tempoFieldSelector)
      .should('have.value', newTempo);

    cy.get('#C5 .hole').first()
      .should('have.attr', 'style', `transform: translateY(${newNoteYPos}px)`);
  });

  describe('Notes', () => {
    it('should be silent when placed too close together', () => {
      cy.visit('/');

      const note1Ypos = 56;
      const note2Ypos = 80;
      const note3Ypos = 104;
      const note4Ypos = 128;

      cy.get('#C5').click(5, note1Ypos);
      cy.get('#C5').click(5, note2Ypos);
      cy.get('#C5').click(5, note3Ypos);
      cy.get('#C5').click(5, note4Ypos);

      cy.get('#C5 .hole:nth-of-type(1)').should('not.have.class', 'is-silent');
      cy.get('#C5 .hole:nth-of-type(2)').should('have.class', 'is-silent');
      cy.get('#C5 .hole:nth-of-type(3)').should('not.have.class', 'is-silent');
      cy.get('#C5 .hole:nth-of-type(4)').should('have.class', 'is-silent');
    });

    it('should play when added', () => {
      cy.visit('/', {
        onLoad(windowObj) {
          cy.stub(windowObj.MusicBoxFun.sampler, 'triggerAttackRelease');
        }
      });

      // Wait for the sampler to load before clicking, to ensure triggerAttackRelease is called.
      cy.get('[data-testid="sampler-loaded"]');

      const note1Ypos = 56;

      cy.get('#C5').click(5, note1Ypos);
      cy.window().its('MusicBoxFun.sampler.triggerAttackRelease').should('be.called');
    });

    it('should not play when added, if silent', () => {
      // Initial state: a test song on a 15-note box, with a single C4 note positioned at a yPos of 16.
      cy.visit('/#1XQAAAAI4AAAAAAAAAABBqEgqBUnq6NgEWNOcFXlCeMiRay8RFbecJtWojVLIeTwIeZxeO8C7Rq6EJn8Pn1hv__60KAA', {
        onLoad(windowObj) {
          cy.stub(windowObj.MusicBoxFun.sampler, 'triggerAttackRelease');
        }
      });

      // Wait for the sampler to load before clicking, to ensure triggerAttackRelease is called.
      cy.get('[data-testid="sampler-loaded"]');

      const silentNoteYPos = 32;

      cy.get('#C4').click(5, silentNoteYPos);
      cy.window().its('MusicBoxFun.sampler.triggerAttackRelease').should('not.be.called');
    });
  });

  describe('Box-type changes', () => {
    it('should make the expected changes, while warning the user if notes would be dropped', () => {
      // Initial state: a test song on a 30-note box, with a single E6 note.
      cy.visit('/#1XQAAAAJnAAAAAAAAAABBqEgqBUnraBGNqmplXnnqfbpxB332HFdCo9dbodRyWnxivdT3xWLcmuwTojP2wE1WrnifjkLupeCJEaaX73OcSFJNmgOq-02QKn__5PhgAA', {
        onBeforeLoad(windowObj) {
          // See https://docs.cypress.io/api/commands/stub.html#Replace-built-in-window-methods-like-prompt
          cy.stub(windowObj, 'confirm').returns(true)
        }
      });

      cy.get(musicBoxTypeSelector).select('20');

      cy.get('#description').should('contain', '20');
      cy.window().its('confirm').should('not.be.called');

      cy.get(musicBoxTypeSelector).select('15');

      cy.get('#description').should('contain', '15');
      cy.get('#E6').should('not.exist');
      cy.window().its('confirm').should('be.called');
    });

    it('should cancel changes, if the user declines to drop notes', () => {
      // Initial state: a test song on a 20-note box, with a single A6 note.
      cy.visit('/#1XQAAAAJJAAAAAAAAAABBqEgqBUnraBGNqmpkM3PqfbpxB332HFdCo9dbodRyWnxivdT3xWLcmuwTojP0K-TblVEGsmjSquByn_-Y0IAA', {
        onBeforeLoad(windowObj) {
          // See https://docs.cypress.io/api/commands/stub.html#Replace-built-in-window-methods-like-prompt
          cy.stub(windowObj, 'confirm').returns(false)
        }
      });

      cy.get(musicBoxTypeSelector).select('30');

      cy.get('#description').should('contain', '20');
      cy.get('#A6').should('exist');
      cy.window().its('confirm').should('be.called');
    });
  });

  describe('Selection zone', () => {
    it('exists', () => {
      cy.visit('/');

      cy.get('[data-testid="selection-drag-zone"]').should('exist');
    });
  });

  describe('Selected notes', () => {
    it('should render with selection rings', () => {
      cy.visit('/');

      cy.get('#C5').click(5, 40);
      cy.get('#C5').click(5, 64); // silent note
      cy.get('#E5').click(5, 40);

      cy.window().then((win) => {
        const newSelectedNotes = { 'C5': [40, 64] };

        win.MusicBoxFun.store.setState('appState.selectedNotes', newSelectedNotes);

        cy.get('#C5 .hole').first().should('have.class', 'is-selected');
        cy.get('#C5 .hole').last().should('have.class', 'is-selected');
        cy.get('#E5 .hole').first().should('not.have.class', 'is-selected');
      });
    });

    it('should be deleted when tapping the backspace key', () => {
      cy.visit('/');

      cy.get('#C5').click(5, 40);
      cy.get('#C5').click(5, 64); // silent note
      cy.get('#E5').click(5, 40);

      cy.window().then((win) => {
        const newSelectedNotes = { 'C5': [40, 64] };

        win.MusicBoxFun.store.setState('appState.selectedNotes', newSelectedNotes);

        cy.get('body').type('{backspace}');

        cy.get('#C5 .hole').should('not.exist');
        cy.get('#E5 .hole').should('exist');
      });
    });

    it('should select all notes when CMD+A is pressed', () => {
      cy.visit('/');

      cy.get('#C5').click(5, 40);
      cy.get('#C5').click(5, 64); // silent note
      cy.get('#E5').click(5, 40);

      cy.get('body').type('{cmd}a');

      cy.get('.hole.is-selected').should('have.length', 3);
    });

    it('should become deselected clicking the page', () => {
      cy.visit('/');

      cy.get('#C5').click(5, 40);
      cy.get('#C5').click(5, 64); // silent note
      cy.get('#E5').click(5, 40);

      cy.get('body').type('{cmd}a');

      cy.get('.hole.is-selected').should('exist');

      cy.get('#workspace').click(5, 5);

      cy.get('.hole.is-selected').should('not.exist');
    });

    it('should remove duplicates on deselect', () => {
      cy.visit('/');

      cy.get('#C5').click(5, 40);
      cy.get('#C5').click(5, 64); // silent note (and future duplicate)

      cy.window().then((win) => {
        win.MusicBoxFun.store.setState('appState.selectedNotes', { 'C5': [40] });

        cy.get('body').type('{downArrow}');

        cy.get('#workspace').click(5, 5);

        cy.get('.hole').should('have.length', 1);
      });
    });

    it('should be nudged by their snap increment when arrow keys are pressed', () => {
      const originalYPos = 16;
      const yPosWith16thNudge = `transform: translateY(${originalYPos + 12}px)`;
      const yPosWithGridNudge = `transform: translateY(${originalYPos + 24}px)`;
      const yPosWithNoSnappingNudge = `transform: translateY(${originalYPos + 1}px)`;
      const yPosWithEighthTripletNudge = `transform: translateY(${originalYPos + 16}px)`;
      const yPosWithQuarterTripletNudge = `transform: translateY(${originalYPos + 32}px)`;

      cy.visit('/');

      cy.get('#C5').click(5, 16);

      cy.get(snapToSelector).select("grid");
      cy.get('body').type('{cmd}a');
      cy.get('body').type('{downArrow}');
      cy.get('#C5 .hole').first().should('have.attr', 'style', yPosWithGridNudge);
      cy.get('body').type('{upArrow}');

      cy.get(snapToSelector).select("16ths");
      cy.get('body').type('{cmd}a');
      cy.get('body').type('{downArrow}');
      cy.get('#C5 .hole').first().should('have.attr', 'style', yPosWith16thNudge);
      cy.get('body').type('{upArrow}');

      cy.get(snapToSelector).select("none");
      cy.get('body').type('{cmd}a');
      cy.get('body').type('{downArrow}');
      cy.get('#C5 .hole').first().should('have.attr', 'style', yPosWithNoSnappingNudge);
      cy.get('body').type('{upArrow}');

      cy.get(snapToSelector).select("⅛ triplet");
      cy.get('body').type('{cmd}a');
      cy.get('body').type('{downArrow}');
      cy.get('#C5 .hole').first().should('have.attr', 'style', yPosWithEighthTripletNudge);
      cy.get('body').type('{upArrow}');

      cy.get(snapToSelector).select("¼ triplet");
      cy.get('body').type('{cmd}a');
      cy.get('body').type('{downArrow}');
      cy.get('#C5 .hole').first().should('have.attr', 'style', yPosWithQuarterTripletNudge);
      cy.get('body').type('{upArrow}');
    });

    it('should ignore snapping when nudged while holding option/alt', () => {
      const originalYPos = 16;
      const yPosWithNudge = `transform: translateY(${originalYPos + 1}px)`;
      const yPosFinal = `transform: translateY(${originalYPos}px)`;

      cy.visit('/');

      cy.get('#C5').click(5, originalYPos);

      cy.get(snapToSelector).select("grid");
      cy.get('body').type('{cmd}a');
      cy.get('body').type('{alt}{downArrow}');
      cy.get('#C5 .hole').first().should('have.attr', 'style', yPosWithNudge);
      cy.get('body').type('{alt}{upArrow}');
      cy.get('#C5 .hole').first().should('have.attr', 'style', yPosFinal);
    });

    it('should allow nudged notes to overlap and pass through existing notes without erasing them', () => {
      cy.visit('/');

      cy.get('#C5').click(5, 16);
      cy.get('#C5').click(5, 40);

      cy.window().then((win) => {
        win.MusicBoxFun.store.setState('appState.selectedNotes', { 'C5': [16] });
        cy.get('body').type('{downArrow}');
        cy.get('#C5 .hole').should('have.length', 2);
        cy.get('body').type('{downArrow}');
        cy.get('#C5 .hole').should('have.length', 2);
        cy.get('#C5 .hole').last().should('have.attr', 'style', 'transform: translateY(64px)');
      });
    });

    it('should create a new page when nudged off the bottom of an existing page', () => {
      const FINAL_NOTE_LINE_Y_POS = 2512;

      cy.visit('/');

      cy.get('#C5').click({ scrollBehavior: 'bottom', x: 5, y: FINAL_NOTE_LINE_Y_POS });

      cy.get(dividersSelector).should('have.length', 0);

      cy.get('body').type('{cmd}a');
      cy.get('body').type('{downArrow}');

      cy.get(dividersSelector).should('have.length', 1);
    });
  });

  describe('copy/paste', () => {
    const fileSelectSelector = '[data-testid="file-select"]';

    it('should enable a user to copy selected notes and paste them into the song.', () => {
      cy.visit('/');

      cy.get('#C5').click(5, 40);
      cy.get('#E5').click(5, 40);

      cy.window().then((win) => {
        const newSelectedNotes = { 'C5': [40] };

        win.MusicBoxFun.store.setState('appState.selectedNotes', newSelectedNotes);

        // Position the page for copy/pasting
        cy.window().scrollTo(0, 0);

        // Copy and paste the selected note.
        cy.get('body').type('{cmd}c');
        cy.get('body').type('{cmd}v');

        // Verify that a new note was added.
        cy.get('#C5 .hole').should('have.length', 2);

        // Verify the location of the new note (the uppermost allowed paste location).
        cy.get('#C5 .hole').first().should('have.attr', 'style', `transform: translateY(16px)`);

        // Verify that existing selections are deselected and the newly pasted note is selected.
        cy.get('#C5 .hole').first().should('have.class', 'is-selected');
        cy.get('#C5 .hole').last().should('not.have.class', 'is-selected');

        // Verify the silent status of newly pasted notes.
        cy.get('#C5 .hole').first().should('not.have.class', 'is-silent');
        cy.get('#C5 .hole').last().should('have.class', 'is-silent');

        // Verify that the song update message is displayed.
        cy.get(songUpdatedSelector).should('be.visible');
      });
    });

    it('should warn the user of dropped notes when pasting notes into an unsupported music box type', () => {
      cy.visit('/', {
        onBeforeLoad(windowObj) {
          // See https://docs.cypress.io/api/commands/stub.html#Replace-built-in-window-methods-like-prompt
          cy.stub(windowObj, 'confirm').returns(true)
        }
      });

      cy.get(musicBoxTypeSelector).select('30');

      cy.get('#C3').click(5, 40); // Unsupported on 15-note box
      cy.get('#C5').click(5, 40); // Supported on 15-note box

      cy.get('body').type('{cmd}a');
      cy.get('body').type('{cmd}c');

      cy.get(fileSelectSelector).select('new-song');

      cy.get(musicBoxTypeSelector).select('15');

      cy.get('body').type('{cmd}v');

      cy.window().its('confirm').should('be.called');

      // Only one note should have been pasted.
      cy.get('.hole').should('have.length', 1);
      cy.get('#C5 .hole').should('have.length', 1);
    });

    it('should create a new page if the users pastes beyond the bottom of the current page', () => {
      cy.visit('/');

      cy.get('#C5').click(5, 40);

      cy.get('body').type('{cmd}a');
      cy.get('body').type('{cmd}c');

      cy.get(dividersSelector).should('have.length', 0);

      cy.window().scrollTo(0, '100%');

      cy.get('body').type('{cmd}v');

      cy.get(dividersSelector).should('have.length', 1);
    });

    it('should drop pasted notes on the next snap-location after the playhead', () => {
      cy.visit('/');

      cy.get('#C5').click(5, 40);

      cy.get('body').type('{cmd}a');
      cy.get('body').type('{cmd}c');

      cy.get(fileSelectSelector).select('new-song');
      cy.get(snapToSelector).select("grid");
      cy.window().scrollTo(0, '100%');
      cy.get('body').type('{cmd}v');
      cy.get('#C5 .hole').should('have.attr', 'style', `transform: translateY(2560px)`);

      cy.get(fileSelectSelector).select('new-song');
      cy.get(snapToSelector).select("16ths");
      cy.window().scrollTo(0, '100%');
      cy.get('body').type('{cmd}v');
      cy.get('#C5 .hole').should('have.attr', 'style', `transform: translateY(2548px)`);

      cy.get(fileSelectSelector).select('new-song');
      cy.get(snapToSelector).select("none");
      cy.window().scrollTo(0, '100%');
      cy.get('body').type('{cmd}v');
      cy.get('#C5 .hole').should('have.attr', 'style', `transform: translateY(2545px)`);

      cy.get(fileSelectSelector).select('new-song');
      cy.get(snapToSelector).select("⅛ triplet");
      cy.window().scrollTo(0, '100%');
      cy.get('body').type('{cmd}v');
      cy.get('#C5 .hole').should('have.attr', 'style', `transform: translateY(2560px)`);

      cy.get(fileSelectSelector).select('new-song');
      cy.get(snapToSelector).select("¼ triplet");
      cy.window().scrollTo(0, '100%');
      cy.get('body').type('{cmd}v');
      cy.get('#C5 .hole').should('have.attr', 'style', `transform: translateY(2576px)`);
    });
  });

  describe('cut/paste', () => {
    it('should enable a user to cut selected notes and paste them into the song.', () => {
      cy.visit('/');

      cy.get('#C5').click(5, 40);
      cy.get('#E5').click(5, 40);

      cy.window().then((win) => {
        const newSelectedNotes = { 'C5': [40] };

        win.MusicBoxFun.store.setState('appState.selectedNotes', newSelectedNotes);

        // Position the page for cut/pasting
        cy.window().scrollTo(0, 0);

        // Cut and paste the selected note.
        cy.get('body').type('{cmd}x');
        cy.get('body').type('{cmd}v');

        // Verify that two notes total remain (the unselected one and the pasted one).
        cy.get('.hole').should('have.length', 2);

        // Verify that the cut note was deleted, leaving only one C5 note (the pasted one).
        cy.get('#C5 .hole').should('have.length', 1);

        // Verify the location of the remaining note (the uppermost allowed paste location).
        cy.get('#C5 .hole').should('have.attr', 'style', `transform: translateY(16px)`);

        // Verify that the newly pasted note is selected.
        cy.get('#C5 .hole').should('have.class', 'is-selected');
      });
    });
  });
});

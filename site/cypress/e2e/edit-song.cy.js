/// <reference types="cypress" />

describe('Song edits', () => {
  const musicBoxTypeSelector = '[data-testid="music-box-type-select"]';

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

      cy.url().then(url2 => {
        cy.get(musicBoxTypeSelector).select(newBoxTypeValue);
        cy.url().should('not.eq', url2);

        cy.url().then(url3 => {
          cy.get(tempoFieldSelector).clear().type(newTempo);
          cy.url().should('not.eq', url3);

          cy.url().then(url4 => {
            cy.get('#C5').click(6, newNoteYPos); // left: 6px, top: 64px
            cy.url().should('not.eq', url4);
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

      cy.get('#C5 .hole:nth-of-type(1)').should('not.have.class', 'silent');
      cy.get('#C5 .hole:nth-of-type(2)').should('have.class', 'silent');
      cy.get('#C5 .hole:nth-of-type(3)').should('not.have.class', 'silent');
      cy.get('#C5 .hole:nth-of-type(4)').should('have.class', 'silent');
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
});

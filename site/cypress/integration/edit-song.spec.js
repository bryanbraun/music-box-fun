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
    const newNoteYPos = 55;

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
            cy.get('[data-id="C5"]').click(5, newNoteYPos); // left: 5px, top: 55px
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

    cy.get('[data-id="C5"] .hole').first()
      .should('have.attr', 'style', `transform: translateY(${newNoteYPos}px)`);
  });

  describe('Notes', () => {
    it('should be silent when placed too close together', () => {
      cy.visit('/');

      const note1Ypos = 56;
      const note2Ypos = 80;
      const note3Ypos = 104;
      const note4Ypos = 128;

      cy.get('[data-id="C5"]').click(5, note1Ypos);
      cy.get('[data-id="C5"]').click(5, note2Ypos);
      cy.get('[data-id="C5"]').click(5, note3Ypos);
      cy.get('[data-id="C5"]').click(5, note4Ypos);

      cy.get('[data-id="C5"] .hole:nth-of-type(1)').should('not.have.class', 'silent');
      cy.get('[data-id="C5"] .hole:nth-of-type(2)').should('have.class', 'silent');
      cy.get('[data-id="C5"] .hole:nth-of-type(3)').should('not.have.class', 'silent');
      cy.get('[data-id="C5"] .hole:nth-of-type(4)').should('have.class', 'silent');
    });

    it('should play when added', () => {
      cy.visit('/', {
        onLoad(windowObj) {
          cy.stub(windowObj.MusicBoxFun.sampler, 'triggerAttackRelease');
        }
      });

      const note1Ypos = 56;

      cy.get('[data-id="C5"]').click(5, note1Ypos);
      cy.window().its('MusicBoxFun.sampler.triggerAttackRelease').should('be.called');
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
      cy.get('[data-id="C#5"]').should('not.exist');
      cy.window().its('confirm').should('not.be.called');

      cy.get(musicBoxTypeSelector).select('15');

      cy.get('#description').should('contain', '15');
      cy.get('[data-id="E6"]').should('not.exist');
      cy.window().its('confirm').should('be.called');
    });
  });
});

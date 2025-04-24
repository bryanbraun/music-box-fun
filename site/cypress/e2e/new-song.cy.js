/// <reference types="cypress" />

describe('New blank song', () => {
  it('should reset the existing song to the correct state when the user confirms', () => {
    // Initial song:
    //   Box type: 20
    //   Title: Example Song
    //   Tempo: 150
    //   Notes: (4 notes)
    cy.visit('/#1XQAAAAJaAAAAAAAAAABBqEgqwjwJccwz7TjYUURJm53DYWWHd5O-jWvrdGYt8bQES650K80d_i9HoRcS3Vfivnj7zifv8Ebmf0gFu3iuv_Wa8wR9-p5a2rIvJqoRQ7eT61_-M8XA', {
      onBeforeLoad(windowObj) {
        cy.stub(windowObj, 'confirm').returns(true)
      }
    });

    cy.get('[data-testid="file-select"]').select('new-song');

    cy.window().its('confirm').should('be.called');

    cy.get('#song-title input')
      .should('have.value', '');

    cy.get('#music-box-type option[selected]')
      .should('have.value', '20');

    cy.get('#tempo-field input')
      .should('have.value', '110');

    cy.get('#note-lines .hole')
      .should('not.exist');
  });

  it('does not reset the existing song when the user cancels', () => {
    // Initial song:
    //   Box type: 20
    //   Title: Example Song
    //   Tempo: 150
    //   Notes: (4 notes)
    cy.visit('/#1XQAAAAJaAAAAAAAAAABBqEgqwjwJccwz7TjYUURJm53DYWWHd5O-jWvrdGYt8bQES650K80d_i9HoRcS3Vfivnj7zifv8Ebmf0gFu3iuv_Wa8wR9-p5a2rIvJqoRQ7eT61_-M8XA', {
      onBeforeLoad(windowObj) {
        cy.stub(windowObj, 'confirm').returns(false)
      }
    });

    cy.get('[data-testid="file-select"]').select('new-song');

    cy.window().its('confirm').should('be.called');

    cy.get('#song-title input')
      .should('have.value', 'Example Song');

    cy.get('#music-box-type option[selected]')
      .should('have.value', '20');

    cy.get('#tempo-field input')
      .should('have.value', '150');

    cy.get('#note-lines .hole')
      .should('have.length', 4);
  });

  it('skips resetting when the song is already blank', () => {
    cy.visit('/', {
      onBeforeLoad(windowObj) {
        cy.stub(windowObj, 'confirm').returns(true) // Stub the confirm dialog to always return true.
      }
    });

    cy.get('[data-testid="file-select"]').select('new-song');
    cy.window().its('confirm').should('not.be.called');
  });
});

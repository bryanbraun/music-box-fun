/// <reference types="cypress" />

describe('New blank song', () => {
  beforeEach(() => {
    // Initial song:
    //   Box type: 20
    //   Title: Example Song
    //   Tempo: 150
    //   Notes: (4 notes)
    cy.visit('/#1XQAAAAJaAAAAAAAAAABBqEgqwjwJccwz7TjYUURJm53DYWWHd5O-jWvrdGYt8bQES650K80d_i9HoRcS3Vfivnj7zifv8Ebmf0gFu3iuv_Wa8wR9-p5a2rIvJqoRQ7eT61_-M8XA');
  });

  it('should reset the existing song to the correct state', () => {
    cy.get('[data-testid="file-select"]').select('new-song');

    cy.get('#song-title input')
      .should('have.value', '');

    cy.get('#music-box-type option[selected]')
      .should('have.value', '20');

    cy.get('#tempo-field input')
      .should('have.value', '110');

    cy.get('#note-lines .hole')
      .should('not.exist');
  });
});

/// <reference types="cypress" />

describe('Defaults', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('includes default page content', () => {
    // Default page details
    cy.title().should('include', 'Music Box Fun');

    // Default song details
    cy.get('#song-title input')
      .should('have.value', '');

    cy.get('#music-box-type option[selected]')
      .should('have.value', '15');

    cy.get('#tempo-field input')
      .should('have.value', '110');

    cy.get('#note-lines .hole')
      .should('not.exist');

    // Default settings
    cy.get('#snap-to-grid input[type="checkbox"]')
      .should('be.checked')
  });
});

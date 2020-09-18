/// <reference types="cypress" />

describe('Extend song', () => {
  const extendButtonSelector = '[data-testid="extend"]';
  const noteLinesSelector = '#note-lines';
  const dividersSelector = '[data-testid="divider"]';

  const APPROXIMATE_SINGLE_PAGE_LENGTH = 2561;
  const TEST_BUFFER = 50;
  const PAGE_TWO_TEST_LOCATION = APPROXIMATE_SINGLE_PAGE_LENGTH + TEST_BUFFER;
  const PAGE_THREE_TEST_LOCATION = 2 * PAGE_TWO_TEST_LOCATION;

  beforeEach(() => {
    cy.visit('/');
  });

  it('should support adding new pages and removing empty pages', () => {
    // Confirm that we can add a new page.
    cy.get(extendButtonSelector).click();

    cy.get(noteLinesSelector).invoke('height').should('gte', PAGE_TWO_TEST_LOCATION);
    cy.get(dividersSelector).should('have.length', 1);

    // Confirm that we can add another new page (multiple new pages).
    cy.get(extendButtonSelector).click();

    cy.get(noteLinesSelector).invoke('height').should('gte', PAGE_THREE_TEST_LOCATION);
    cy.get(dividersSelector).should('have.length', 2);

    // Confirm that we can remove a page.
    cy.get('#dividers > div:last-child button').click();

    cy.get(noteLinesSelector).invoke('height').should('lte', PAGE_THREE_TEST_LOCATION);
    cy.get(dividersSelector).should('have.length', 1);
  });

  it('should not allow removal of any pages prior to, or including, any page with notes', () => {
    cy.get(extendButtonSelector).click();
    cy.get(extendButtonSelector).click();
    cy.get(extendButtonSelector).click();

    cy.get('[data-id="C5"]').click(5, PAGE_THREE_TEST_LOCATION, { force: true });

    cy.get('[data-testid="divider"]:nth-child(1) button').should('not.be.visible');
    cy.get('[data-testid="divider"]:nth-child(2) button').should('not.be.visible');
    cy.get('[data-testid="divider"]:nth-child(3) button').should('be.visible');
  });

  it('should remove any extra empty pages on page reload', () => {
    cy.get(extendButtonSelector).click();
    cy.get(extendButtonSelector).click();

    cy.get('[data-id="C5"]').click(5, PAGE_TWO_TEST_LOCATION, { force: true });

    // This ensures that cypress waits until the hash updates before reloading the page.
    cy.hash().should('not.eq', '');

    cy.reload(true);

    cy.get(dividersSelector).should('have.length', 1);
    cy.get(noteLinesSelector).invoke('height').should('lte', PAGE_THREE_TEST_LOCATION);
  });

});

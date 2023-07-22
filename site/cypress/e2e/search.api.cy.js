const searchFormSelector = 'form#search__form';
const searchBoxSelector = 'input[type="search"]';
const autocompleteResultsSelector = '#search__results';
const browseSongsSelector = '#browse__songs';

describe('Song Search', () => {
  it("populates autocompleted search results", () => {
    cy.visit('/');

    cy.get(searchBoxSelector).type('Mario');
    cy.get(autocompleteResultsSelector).get('li').should('have.length.greaterThan', 3);
  });

  it("creates a search results page and working 'back' button", () => {
    cy.visit('/');

    cy.get(searchBoxSelector).type('Mario');
    cy.get(searchFormSelector).find('button[type="submit"]').click();

    cy.contains('h2', 'Search all "Mario"').should('exist');
    cy.get(browseSongsSelector).find('li').should('have.length.greaterThan', 3);

    cy.contains('button', "Back to Browse").click();

    cy.contains('Browse Song Library').should('exist');
  });

  it("displays a functional 'Search all' button", () => {
    cy.visit('/');

    cy.get(searchBoxSelector).type('Mario');
    cy.contains('button', 'Search all "Mario"').click();

    cy.contains('h2', 'Search all "Mario"').should('exist');
    cy.get(browseSongsSelector).find('li').should('have.length.greaterThan', 3);
  });
});

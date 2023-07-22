const songLibrarySelector = '#library-songs';
const browseSongsSelector = '#browse__songs';

describe('Song Library', () => {
  it("displays a list of songs by default", () => {
    cy.visit('/');

    cy.contains('Browse Song Library').should('exist');

    cy.get(songLibrarySelector).children().should('have.length.greaterThan', 10);
    cy.contains('A problem occurred while trying to get songs.').should('not.exist')
  });

  it("clicking a song loads it into the workspace", () => {
    cy.visit('/');

    cy.scrollTo('0%', '50%');

    cy.window().its('scrollY').should('not.equal', 0);

    cy.get(songLibrarySelector).find('a').first().click();

    // Confirm that the new song has been scrolled to the top of the page.
    cy.window().its('scrollY').should('equal', 0);

    // Confirm that a new song has taken the place of the blank defaults.
    cy.get('#song-title input')
      .should('not.have.value', '');

    cy.get('#tempo-field input')
      .should('not.have.value', '110');

    cy.get('#note-lines .hole')
      .should('exist');
  });

  it("loads more songs when the user scrolls to the bottom of the list", () => {
    cy.visit('/');

    cy.get(songLibrarySelector).children().then($els => {
      let initialSongCount = $els.length;

      cy.get(browseSongsSelector).scrollTo('0%', '90%'); // song loading is triggered at 80%.

      cy.get(songLibrarySelector).children().should('have.length.greaterThan', initialSongCount);
    });
  });
});

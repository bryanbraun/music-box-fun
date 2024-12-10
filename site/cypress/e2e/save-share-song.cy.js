describe('Copy song link button', () => {
  it('should copy the song link to the clipboard', () => {
    cy.visit('/');

    cy.get('[data-testid="song-link-button"]').click();

    // assertion works for Electron browser only. For details, see:
    // https://stackoverflow.com/a/69571115/1154642
    cy.window().its('navigator.clipboard')
      .invoke('readText').should('equal', 'https://localhost/')
  });
});

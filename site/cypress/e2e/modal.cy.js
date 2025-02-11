describe('Modal Component', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should open modal when clicking info button', () => {
    cy.get('.info-button').should('be.visible').click({ force: true });
    cy.get('music-box-modal').shadow().then(($shadow) => {
      cy.wrap($shadow).find('.modal-overlay').should('have.css', 'display', 'flex');
    });
  });

  it('should close modal when clicking close button', () => {
    cy.get('.info-button').click({ force: true });
    cy.get('music-box-modal')
      .shadow()
      .find('.modal-close')
      .click({ force: true });
    cy.get('music-box-modal')
      .shadow()
      .find('.modal-content')
      .should('not.be.visible');
  });

  it('should close modal when clicking outside', () => {
    cy.get('.info-button').click({ force: true });
    cy.get('music-box-modal')
      .shadow()
      .find('.modal-overlay')
      .click('topLeft', { force: true });
    cy.get('music-box-modal')
      .shadow()
      .find('.modal-content')
      .should('not.be.visible');
  });

  it('should contain correct content', () => {
    cy.get('.info-button').click({ force: true });
    cy.get('music-box-modal').within(() => {
      cy.get('h2').should('contain', 'About Music Box Fun');
      cy.get('p').should('have.length', 3);
      cy.get('a').should('have.attr', 'href', '/guides');
    });
  });
}); 
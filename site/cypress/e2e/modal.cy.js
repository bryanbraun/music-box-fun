describe('Modal Component', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.handleError = () => {}
      }
    });
  });

  it('opens when clicking the info button', () => {
    cy.get('.info-button').click();
    cy.get('music-box-modal').should('be.visible').and('have.attr', 'open');
  });

  it('closes when clicking the close button', () => {
    cy.get('.info-button').click();
    cy.get('music-box-modal').should('be.visible');
    cy.get('music-box-modal')
      .shadow()
      .find('[data-testid="modal-close"]')
      .click({force: true});
    cy.get('music-box-modal').should('not.have.attr', 'open');
  });

  it('closes when clicking outside the modal', () => {
    cy.get('.info-button').click();
    cy.get('music-box-modal').should('be.visible');
    cy.get('music-box-modal')
      .shadow()
      .find('[data-testid="modal-overlay"]')
      .click({force: true});
    cy.get('music-box-modal').should('not.have.attr', 'open');
  });

  it('closes when pressing Escape key', () => {
    cy.get('.info-button').click();
    cy.get('music-box-modal').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('music-box-modal').should('not.have.attr', 'open');
  });
});
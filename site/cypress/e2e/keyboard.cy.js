/// <reference types="cypress" />

describe('Keyboard shortcuts', () => {
  describe('Undo and Redo', () => {
    before(() => {
      cy.visit('/', {
        onBeforeLoad(windowObj) {
          windowObj.history.back = cy.stub();
          windowObj.history.forward = cy.stub();
        }
      });
    });

    it('CMD+Z navigates back', () => {
      cy.get('body').type('{cmd}z');
      cy.window().its('history.back').should('be.called');
    });
    it('CTRL+Z navigates back', () => {
      cy.get('body').type('{ctrl}z');
      cy.window().its('history.back').should('be.called');
    });
    it('CMD+SHIFT+Z navigates forward', () => {
      cy.get('body').type('{cmd}{shift}z');
      cy.window().its('history.forward').should('be.called');
    });
    it('CTRL+SHIFT+Z navigates forward', () => {
      cy.get('body').type('{ctrl}{shift}z');
      cy.window().its('history.forward').should('be.called');
    });
  });

  // Note: the "Space bar to play" feature is already be tested in play-song.spec.js
});

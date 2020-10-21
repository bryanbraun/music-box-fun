/// <reference types="cypress" />

describe('Playing a song', () => {
  it('clicking play triggers the expected behaviors', () => {
    cy.visit('/', {
      onLoad(windowObj) {
        cy.spy(windowObj.MusicBoxFun.Transport, 'start');
        cy.spy(windowObj.MusicBoxFun.Transport, 'stop');
      }
    });

    const sidebarPlayButtonSelector = '#sidebar-play-button [data-testid="play-button"]';

    cy.get(sidebarPlayButtonSelector).click(); // play
    cy.get(sidebarPlayButtonSelector)
      .should('have.attr', 'aria-pressed', 'true')
      .and('have.attr', 'aria-label', 'Pause (Space)')
      .and('have.attr', 'title', 'Pause (Space)');
    cy.window().its('MusicBoxFun.Transport.start')
      .should('be.called');

    cy.get(sidebarPlayButtonSelector).click(); // pause
    cy.get(sidebarPlayButtonSelector)
      .should('have.attr', 'aria-pressed', 'false')
      .and('have.attr', 'aria-label', 'Play (Space)')
      .and('have.attr', 'title', 'Play (Space)');
    cy.window().its('MusicBoxFun.Transport.stop')
      .should('be.called');

    cy.get('body').type(' '); // play via keyboard
    cy.get(sidebarPlayButtonSelector)
      .should('have.attr', 'aria-pressed', 'true')
      .and('have.attr', 'aria-label', 'Pause (Space)')
      .and('have.attr', 'title', 'Pause (Space)');
  });
});


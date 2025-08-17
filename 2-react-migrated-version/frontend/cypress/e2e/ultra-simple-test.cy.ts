// Ultra simple test - just verify the site loads
describe('Ultra Simple Test', () => {
  it('Should load the homepage without error', () => {
    cy.visit('/', { timeout: 60000, retryOnStatusCodeFailure: true });
    
    // Just verify the page loaded and has some content
    cy.get('body').should('exist');
    cy.get('html').should('contain.text', 'כ'); // Just check for any Hebrew character
    
    // Log success
    cy.log('✅ Homepage loaded successfully');
  });

  it('Should have a React app root element', () => {
    cy.visit('/');
    cy.get('#root').should('exist');
    cy.log('✅ React app root found');
  });

  it('Should not show 404 or error page', () => {
    cy.visit('/');
    cy.get('body').should('not.contain', '404');
    cy.get('body').should('not.contain', 'Cannot GET');
    cy.get('body').should('not.contain', 'Error');
    cy.log('✅ No error messages detected');
  });
});
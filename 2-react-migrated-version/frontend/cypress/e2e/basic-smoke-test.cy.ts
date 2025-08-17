// Basic smoke test for CI environment
// Tests essential functionality without complex interactions

describe('Basic Smoke Tests', () => {
  beforeEach(() => {
    // Set longer timeout for CI
    cy.visit('/', { timeout: 60000 });
  });

  it('Should load homepage successfully', () => {
    // Test that homepage loads
    cy.get('body').should('be.visible');
    cy.contains('המוצרים שלנו').should('be.visible');
    
    // Test that Hebrew content is displayed (not English/Spanish)
    cy.get('body').should('not.contain', 'Our Products');
    cy.get('body').should('not.contain', 'Nuestros Productos');
  });

  it('Should be able to navigate to admin login', () => {
    // Navigate to admin login
    cy.visit('/admin/login', { timeout: 30000 });
    
    // Check login form exists
    cy.get('input[type="email"]', { timeout: 15000 }).should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('Should display Hebrew interface elements', () => {
    // Check for Hebrew content on homepage
    cy.contains('המוצרים שלנו').should('be.visible');
    
    // If products exist, check they have Hebrew names
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="product-card"]').length > 0) {
        cy.get('[data-testid="product-card"]').first().within(() => {
          cy.get('button').contains('צפה במוצר').should('be.visible');
        });
      } else {
        cy.log('No products found - this is OK for basic smoke test');
      }
    });
  });

  it('Should not display English or Spanish content', () => {
    // Verify Hebrew-only interface
    cy.get('body').should('not.contain', 'View Product');
    cy.get('body').should('not.contain', 'Add Product');
    cy.get('body').should('not.contain', 'English');
    cy.get('body').should('not.contain', 'Spanish');
    cy.get('body').should('not.contain', 'en:');
    cy.get('body').should('not.contain', 'es:');
  });
});
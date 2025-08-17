// cypress/support/e2e.ts
import './commands'

// Prevent Cypress from failing on uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test on uncaught exceptions
  // This is useful for apps that might have harmless errors in development mode
  return false
})

// Add custom commands for Hebrew text and admin workflow
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<Element>
      createTestProduct(productData: any): Chainable<Element>
      verifyHebrewText(text: string): Chainable<Element>
    }
  }
}
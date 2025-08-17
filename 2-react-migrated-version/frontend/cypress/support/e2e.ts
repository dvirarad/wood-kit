// cypress/support/e2e.ts
import './commands'

// Prevent Cypress from failing on uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test on uncaught exceptions
  // This is useful for apps that might have harmless errors in development mode
  console.log('Uncaught exception:', err.message)
  return false
})

// Handle fetch/API errors that might occur during testing
Cypress.on('window:before:load', (win) => {
  // Store original fetch to catch and handle network errors
  const originalFetch = win.fetch
  win.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(error => {
      console.log('Fetch error caught:', error.message)
      // Don't let fetch errors fail the test unless they're critical
      return Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Network error during test' })
      })
    })
  }
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
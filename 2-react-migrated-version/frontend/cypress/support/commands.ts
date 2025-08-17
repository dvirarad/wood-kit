// cypress/support/commands.ts

// Custom command for admin login
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/admin/login')
  cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible').type('admin@woodkits.com')
  cy.get('input[type="password"]').type('admin123')
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/admin/products', { timeout: 10000 })
})

// Custom command for creating test product
Cypress.Commands.add('createTestProduct', (productData) => {
  cy.get('button').contains('הוסף מוצר חדש').should('be.visible').click()
  
  // Wait for dialog to be visible
  cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible')
  
  // Fill basic information - more robust selectors
  cy.get('input').first().clear().type(productData.name)
  cy.get('textarea').eq(0).clear().type(productData.description)
  cy.get('textarea').eq(1).clear().type(productData.shortDescription)  
  cy.get('textarea').eq(2).clear().type(productData.fullDescription)
  
  // Set category
  cy.get('[role="combobox"]').click()
  cy.get('li').contains('רהיטים').click()
  
  // Set price and inventory
  cy.get('input[type="number"]').eq(0).clear().type(productData.basePrice.toString())
  cy.get('input[type="number"]').last().clear().type(productData.stockLevel.toString())
  
  // Configure shelves dimension
  cy.contains('כמות מדפים').parent().parent().within(() => {
    cy.get('input').eq(2).clear().type('3') // default shelves
    cy.get('input').eq(3).clear().type('30') // price per shelf
  })
  
  // Save product
  cy.get('button').contains('שמור').click()
  
  // Wait for dialog to close
  cy.get('[role="dialog"]').should('not.exist')
})

// Custom command for verifying Hebrew text
Cypress.Commands.add('verifyHebrewText', (text) => {
  cy.contains(text).should('be.visible')
  // Additional Hebrew text validation can be added here
})
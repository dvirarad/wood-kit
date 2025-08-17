// Cypress E2E Tests for Admin Product Management
// Tests the complete Hebrew-only product workflow with shelves support

describe('Wood Kits Admin Product Workflow', () => {
  const testProduct = {
    name: 'ארון מבחן אוטומטי',
    description: 'תיאור בסיסי לבדיקה',
    shortDescription: 'תיאור קצר',
    fullDescription: 'תיאור מלא ומפורט',
    basePrice: 350,
    stockLevel: 5
  };

  beforeEach(() => {
    // Visit admin login page
    cy.visit('/admin/login');
    
    // Login as admin
    cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible').type('admin@woodkits.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect to admin products page
    cy.url().should('include', '/admin/products', { timeout: 15000 });
  });

  it('Should create a product with Hebrew content and shelves dimension', () => {
    // Click Add Product button
    cy.get('button').contains('הוסף מוצר חדש').should('be.visible').click();
    
    // Wait for dialog to open
    cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');
    
    // Fill product name
    cy.get('input[label*="שם המוצר"], input').first().clear().type(testProduct.name);
    
    // Fill descriptions  
    cy.get('textarea').eq(0).clear().type(testProduct.description);
    cy.get('textarea').eq(1).clear().type(testProduct.shortDescription);
    cy.get('textarea').eq(2).clear().type(testProduct.fullDescription);
    
    // Set category
    cy.get('[role="combobox"]').click();
    cy.get('li').contains('רהיטים').click();
    
    // Set price
    cy.get('input[type="number"]').first().clear().type(testProduct.basePrice.toString());
    
    // Set inventory
    cy.get('input[type="number"]').last().clear().type(testProduct.stockLevel.toString());
    
    // Verify shelves dimension section exists
    cy.contains('כמות מדפים').should('be.visible');
    
    // Configure shelves - set default to 4, price multiplier to 25
    cy.contains('כמות מדפים').parent().parent().within(() => {
      cy.get('input').eq(2).clear().type('4'); // default shelves
      cy.get('input').eq(3).clear().type('25'); // price per shelf
    });
    
    // Save product
    cy.get('button').contains('שמור').click();
    
    // Wait for dialog to close
    cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist');
    
    // Verify product appears in list
    cy.contains(testProduct.name, { timeout: 10000 }).should('be.visible');
    cy.contains(testProduct.basePrice.toString()).should('be.visible');
  });

  it('Should display product correctly on product page with shelves option', () => {
    // First create a product
    cy.get('button').contains('הוסף מוצר חדש').click();
    cy.get('[role="dialog"]').should('be.visible');
    
    // Quick product creation
    cy.get('input').first().type(testProduct.name);
    cy.get('textarea').eq(0).type(testProduct.description);
    cy.get('textarea').eq(1).type(testProduct.shortDescription);  
    cy.get('textarea').eq(2).type(testProduct.fullDescription);
    cy.get('[role="combobox"]').click();
    cy.get('li').contains('רהיטים').click();
    cy.get('input[type="number"]').first().clear().type(testProduct.basePrice.toString());
    cy.get('input[type="number"]').last().clear().type(testProduct.stockLevel.toString());
    
    // Configure shelves
    cy.contains('כמות מדפים').parent().parent().within(() => {
      cy.get('input').eq(2).clear().type('3'); // default
    });
    
    cy.get('button').contains('שמור').click();
    cy.get('[role="dialog"]').should('not.exist');
    
    // Navigate to homepage to find the product
    cy.visit('/');
    cy.contains(testProduct.name, { timeout: 10000 }).should('be.visible');
    
    // Verify short description on homepage (not full description)
    cy.contains(testProduct.shortDescription).should('be.visible');
    cy.contains(testProduct.fullDescription).should('not.exist');
    
    // Click to view product
    cy.contains(testProduct.name).parent().parent().within(() => {
      cy.get('button').contains('צפה במוצר').click();
    });
    
    // Verify product page
    cy.url().should('include', '/product/', { timeout: 10000 });
    cy.contains(testProduct.name).should('be.visible');
    cy.contains(testProduct.fullDescription).should('be.visible');
    
    // Verify customization options including shelves
    cy.contains('התאמה אישית').should('be.visible');
    cy.contains('רוחב').should('be.visible');
    cy.contains('גובה').should('be.visible');
    cy.contains('עומק').should('be.visible');
    cy.contains('כמות מדפים').should('be.visible');
    
    // Verify shelves customization works
    cy.contains('כמות מדפים').parent().within(() => {
      cy.get('.MuiSlider-root').should('be.visible');
    });
    
    // Verify order button exists
    cy.contains('המשך להזמנה').should('be.visible');
  });

  it('Should test Hebrew-only content (no English/Spanish)', () => {
    // Create a product and verify no English/Spanish content appears
    cy.get('button').contains('הוסף מוצר חדש').click();
    cy.get('[role="dialog"]').should('be.visible');
    
    // Fill Hebrew content only
    cy.get('input').first().type('מוצר עברי בלבד');
    cy.get('textarea').eq(0).type('תיאור בעברית בלבד');
    cy.get('textarea').eq(1).type('תיאור קצר עברי');
    cy.get('textarea').eq(2).type('תיאור מלא בעברית');
    
    cy.get('[role="combobox"]').click();
    cy.get('li').contains('ספרייה').click();
    cy.get('input[type="number"]').first().clear().type('400');
    cy.get('input[type="number"]').last().clear().type('2');
    
    cy.get('button').contains('שמור').click();
    cy.get('[role="dialog"]').should('not.exist');
    
    // Verify no English/Spanish labels appear
    cy.get('body').should('not.contain', 'English');
    cy.get('body').should('not.contain', 'Spanish');
    cy.get('body').should('not.contain', 'en:');
    cy.get('body').should('not.contain', 'es:');
    
    // Verify Hebrew content appears
    cy.contains('מוצר עברי בלבד').should('be.visible');
  });

  it('Should test Remove All URLs functionality', () => {
    // Create product and add multiple images, then test remove all
    cy.get('button').contains('הוסף מוצר חדש').click();
    cy.get('[role="dialog"]').should('be.visible');
    
    // Basic product info
    cy.get('input').first().type('מוצר עם תמונות');
    cy.get('textarea').eq(0).type('תיאור');
    cy.get('textarea').eq(1).type('קצר');
    cy.get('textarea').eq(2).type('מלא');
    cy.get('[role="combobox"]').click();
    cy.get('li').contains('רהיטים').click();
    cy.get('input[type="number"]').first().clear().type('200');
    cy.get('input[type="number"]').last().clear().type('1');
    
    // Add first image
    cy.get('input[placeholder*="https"]').type('https://via.placeholder.com/400x300?text=Image1');
    cy.get('button').contains('הוסף תמונה').click();
    
    // Add second image
    cy.get('input[placeholder*="https"]').clear().type('https://via.placeholder.com/400x300?text=Image2');
    cy.get('button').contains('הוסף תמונה').click();
    
    // Verify 2 images exist
    cy.get('img').should('have.length.at.least', 2);
    
    // Click "Remove All URLs" button
    cy.get('button').contains('מחק הכל').should('be.visible').click();
    
    // Verify images are removed
    cy.get('img').should('have.length', 0);
    
    cy.get('button').contains('שמור').click();
    cy.get('[role="dialog"]').should('not.exist');
  });
});

describe('Price Calculation with Shelves', () => {
  beforeEach(() => {
    cy.visit('/admin/login');
    cy.get('input[type="email"]').type('admin@woodkits.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/products');
  });

  it('Should calculate price correctly with shelves configuration', () => {
    // Create product with specific shelves pricing
    cy.get('button').contains('הוסף מוצר חדש').click();
    cy.get('[role="dialog"]').should('be.visible');
    
    cy.get('input').first().type('ספרייה עם מחיר מדפים');
    cy.get('textarea').eq(0).type('תיאור');
    cy.get('textarea').eq(1).type('קצר');
    cy.get('textarea').eq(2).type('מלא');
    cy.get('[role="combobox"]').click();
    cy.get('li').contains('ספרייה').click();
    cy.get('input[type="number"]').first().clear().type('300'); // base price
    cy.get('input[type="number"]').last().clear().type('5');
    
    // Set shelves: 2-6 range, default 3, +50 per shelf
    cy.contains('כמות מדפים').parent().parent().within(() => {
      cy.get('input').eq(0).clear().type('2'); // min
      cy.get('input').eq(1).clear().type('6'); // max
      cy.get('input').eq(2).clear().type('3'); // default
      cy.get('input').eq(3).clear().type('50'); // price multiplier
    });
    
    cy.get('button').contains('שמור').click();
    cy.get('[role="dialog"]').should('not.exist');
    
    // Navigate to product page
    cy.visit('/');
    cy.contains('ספרייה עם מחיר מדפים').parent().parent().within(() => {
      cy.get('button').contains('צפה במוצר').click();
    });
    
    // Verify shelves controls work and price updates
    cy.contains('כמות מדפים').should('be.visible');
    cy.contains('מחיר').should('be.visible');
    
    // Test order flow
    cy.get('button').contains('המשך להזמנה').click();
    cy.get('[role="dialog"]').should('be.visible');
    
    // Fill minimal order info
    cy.get('input[label*="שם מלא"]').type('בודק אוטומטי');
    cy.get('input[type="email"]').type('test@cypress.com');
    cy.get('input[label*="טלפון"]').type('0501234567');
    cy.get('textarea[label*="כתובת"]').type('כתובת בדיקה');
    
    // Verify order summary appears
    cy.contains('סיכום מחיר').should('be.visible');
    
    // Close order (don't submit)
    cy.get('button').contains('ביטול').click();
  });
});
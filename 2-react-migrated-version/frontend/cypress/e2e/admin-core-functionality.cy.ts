// Core Admin Product Management Tests
// Focused on essential admin functionality without backend dependencies

describe('Core Admin Product Management', () => {
  const timestamp = Date.now();
  const testProduct = {
    name: `ארון מבחן ${timestamp}`,
    description: 'תיאור בסיסי',
    shortDescription: 'תיאור קצר',
    fullDescription: 'תיאור מלא',
    basePrice: 250,
    stockLevel: 3
  };

  beforeEach(() => {
    // Login to admin
    cy.visit('/admin/login');
    cy.get('input[type="email"]', { timeout: 10000 }).type('admin@woodkits.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/products', { timeout: 15000 });
  });

  it('Should successfully create and save a Hebrew product with shelves', () => {
    // Open add product dialog
    cy.get('button').contains('הוסף מוצר חדש').click();
    cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');
    
    // Fill product details
    cy.get('input').first().clear().type(testProduct.name);
    cy.get('textarea').eq(0).clear().type(testProduct.description);
    cy.get('textarea').eq(1).clear().type(testProduct.shortDescription);
    cy.get('textarea').eq(2).clear().type(testProduct.fullDescription);
    
    // Set category
    cy.get('[role="combobox"]').click();
    cy.get('li').contains('רהיטים').click();
    
    // Set price and inventory
    cy.get('input[type="number"]').first().clear().type(testProduct.basePrice.toString());
    cy.get('input[type="number"]').last().clear().type(testProduct.stockLevel.toString());
    
    // Configure shelves dimension
    cy.contains('כמות מדפים').should('be.visible');
    cy.contains('כמות מדפים').parent().parent().within(() => {
      cy.get('input').eq(2).clear().type('3'); // default shelves
      cy.get('input').eq(3).clear().type('20'); // price per shelf
    });
    
    // Save product
    cy.get('button').contains('שמור').click();
    cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist');
    
    // Verify product appears in admin list
    cy.contains(testProduct.name, { timeout: 10000 }).should('be.visible');
    cy.contains(testProduct.basePrice.toString()).should('be.visible');
  });

  it('Should display Hebrew content correctly on homepage', () => {
    // First create a product
    cy.get('button').contains('הוסף מוצר חדש').click();
    cy.get('[role="dialog"]').should('be.visible');
    
    cy.get('input').first().type(testProduct.name);
    cy.get('textarea').eq(0).type(testProduct.description);
    cy.get('textarea').eq(1).type(testProduct.shortDescription);
    cy.get('textarea').eq(2).type(testProduct.fullDescription);
    cy.get('[role="combobox"]').click();
    cy.get('li').contains('רהיטים').click();
    cy.get('input[type="number"]').first().clear().type(testProduct.basePrice.toString());
    cy.get('input[type="number"]').last().clear().type(testProduct.stockLevel.toString());
    
    cy.get('button').contains('שמור').click();
    cy.get('[role="dialog"]').should('not.exist');
    
    // Navigate to homepage
    cy.visit('/', { timeout: 10000 });
    
    // Verify product appears with correct Hebrew content
    cy.contains(testProduct.name, { timeout: 10000 }).should('be.visible');
    cy.contains(testProduct.shortDescription).should('be.visible');
    
    // Verify short description is shown, not full description
    cy.contains(testProduct.fullDescription).should('not.exist');
    
    // Verify product card has view button
    cy.contains(testProduct.name).parent().parent().within(() => {
      cy.get('button').contains('צפה במוצר').should('be.visible');
    });
  });

  it('Should display full product details on product page', () => {
    // Create product first
    cy.get('button').contains('הוסף מוצר חדש').click();
    cy.get('[role="dialog"]').should('be.visible');
    
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
      cy.get('input').eq(2).clear().type('4'); // default shelves
    });
    
    cy.get('button').contains('שמור').click();
    cy.get('[role="dialog"]').should('not.exist');
    
    // Go to homepage and click on product
    cy.visit('/');
    cy.contains(testProduct.name, { timeout: 10000 }).parent().parent().within(() => {
      cy.get('button').contains('צפה במוצר').click();
    });
    
    // Verify we're on product page
    cy.url().should('include', '/product/', { timeout: 10000 });
    
    // Verify product details
    cy.contains(testProduct.name).should('be.visible');
    cy.contains(testProduct.fullDescription).should('be.visible');
    
    // Verify customization options
    cy.contains('התאמה אישית').should('be.visible');
    cy.contains('רוחב').should('be.visible');
    cy.contains('גובה').should('be.visible');
    cy.contains('עומק').should('be.visible');
    cy.contains('כמות מדפים').should('be.visible');
    
    // Verify order button exists (but don't click to avoid backend issues)
    cy.get('button').contains('המשך להזמנה').should('be.visible');
  });

  it('Should test Remove All URLs functionality', () => {
    cy.get('button').contains('הוסף מוצר חדש').click();
    cy.get('[role="dialog"]').should('be.visible');
    
    // Basic product info
    cy.get('input').first().type('מוצר לבדיקת תמונות');
    cy.get('textarea').eq(0).type('תיאור');
    cy.get('textarea').eq(1).type('קצר');
    cy.get('textarea').eq(2).type('מלא');
    cy.get('[role="combobox"]').click();
    cy.get('li').contains('רהיטים').click();
    cy.get('input[type="number"]').first().clear().type('150');
    cy.get('input[type="number"]').last().clear().type('1');
    
    // Add image
    cy.get('input[placeholder*="https"]').type('https://via.placeholder.com/400x300?text=Test');
    cy.get('button').contains('הוסף תמונה').click();
    
    // Verify image was added
    cy.get('img').should('have.length.at.least', 1);
    
    // Click Remove All URLs
    cy.get('button').contains('מחק הכל').should('be.visible').click();
    
    // Verify images removed
    cy.get('img').should('have.length', 0);
    
    // Save product
    cy.get('button').contains('שמור').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('Should validate Hebrew-only content (no English/Spanish)', () => {
    cy.get('button').contains('הוסף מוצר חדש').click();
    cy.get('[role="dialog"]').should('be.visible');
    
    // Create product with Hebrew content
    cy.get('input').first().type('מוצר עברי טהור');
    cy.get('textarea').eq(0).type('תיאור בעברית בלבד');
    cy.get('textarea').eq(1).type('תיאור קצר עברי');
    cy.get('textarea').eq(2).type('תיאור מלא בעברית');
    
    cy.get('[role="combobox"]').click();
    cy.get('li').contains('ספרייה').click();
    cy.get('input[type="number"]').first().clear().type('300');
    cy.get('input[type="number"]').last().clear().type('2');
    
    cy.get('button').contains('שמור').click();
    cy.get('[role="dialog"]').should('not.exist');
    
    // Check admin page for no English/Spanish
    cy.get('body').should('not.contain', 'English');
    cy.get('body').should('not.contain', 'Spanish');
    cy.get('body').should('not.contain', 'en:');
    cy.get('body').should('not.contain', 'es:');
    
    // Check homepage
    cy.visit('/');
    cy.get('body').should('not.contain', 'English');
    cy.get('body').should('not.contain', 'Spanish');
    
    // Verify Hebrew content exists
    cy.contains('מוצר עברי טהור').should('be.visible');
  });
});
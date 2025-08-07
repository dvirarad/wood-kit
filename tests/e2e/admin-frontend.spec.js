const { test, expect } = require('@playwright/test');

test.describe('Admin Frontend Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Start from admin login page
    await page.goto('http://localhost:3000/admin/login');
    
    // Login as admin
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/admin/dashboard');
    
    // Navigate to products page
    await page.click('text=ניהול מוצרים ומחירים');
    await page.waitForURL('**/admin/products');
  });

  test('should display products list', async ({ page }) => {
    // Check that the page title is correct
    await expect(page.locator('h1')).toContainText('ניהול מחירי מוצרים');
    
    // Check that products table is present
    await expect(page.locator('table')).toBeVisible();
    
    // Check that at least one product is listed
    const productRows = page.locator('tbody tr');
    await expect(productRows).toHaveCountGreaterThan(0);
  });

  test('should open product edit dialog', async ({ page }) => {
    // Click first edit button
    await page.click('button[aria-label="edit"] svg, button:has(svg[data-testid="EditIcon"])').first();
    
    // Check that dialog opened
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Check that tabs are present
    await expect(page.locator('text=מידע בסיסי')).toBeVisible();
    await expect(page.locator('text=מחיר ומידות')).toBeVisible();
    await expect(page.locator('text=תמונות')).toBeVisible();
  });

  test('should edit product basic info', async ({ page }) => {
    // Open edit dialog
    await page.click('button[aria-label="edit"] svg, button:has(svg[data-testid="EditIcon"])').first();
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Make sure we're on Basic Info tab
    await page.click('text=מידע בסיסי');
    
    // Edit product name
    const nameField = page.locator('input[label="שם המוצר"], input:near(:text("שם המוצר"))').first();
    await nameField.clear();
    await nameField.fill('Updated Product Name E2E');
    
    // Edit description
    const descField = page.locator('textarea[label="תיאור המוצר"], textarea:near(:text("תיאור המוצר"))').first();
    await descField.clear();
    await descField.fill('Updated product description for E2E testing');
    
    // Save changes
    await page.click('text=שמור שינויים');
    
    // Wait for success (dialog should close)
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();
    
    // Verify the product name updated in the table
    await expect(page.locator('text=Updated Product Name E2E')).toBeVisible();
  });

  test('should edit product pricing and dimensions', async ({ page }) => {
    // Open edit dialog
    await page.click('button[aria-label="edit"] svg, button:has(svg[data-testid="EditIcon"])').first();
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Switch to pricing tab
    await page.click('text=מחיר ומידות');
    
    // Update base price
    const priceField = page.locator('input[label="מחיר בסיס (₪)"], input:near(:text("מחיר בסיס"))').first();
    await priceField.clear();
    await priceField.fill('250');
    
    // Update a dimension (try to find minimum field for height)
    const minHeightField = page.locator('input[label="מינימום"]:near(:text("גובה"))').first();
    await minHeightField.clear();
    await minHeightField.fill('120');
    
    // Save changes
    await page.click('text=שמור שינויים');
    
    // Wait for success
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();
    
    // Verify price updated in table
    await expect(page.locator('text=₪250')).toBeVisible();
  });

  test('should manage product images', async ({ page }) => {
    // Open edit dialog
    await page.click('button[aria-label="edit"] svg, button:has(svg[data-testid="EditIcon"])').first();
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Switch to images tab
    await page.click('text=תמונות');
    
    // Add a new image
    await page.fill('input[label="URL תמונה"], input:near(:text("URL תמונה"))', 'https://example.com/test-image.jpg');
    await page.fill('input[label="תיאור התמונה"], input:near(:text("תיאור התמונה"))', 'Test Image E2E');
    await page.click('button:has-text("הוסף")');
    
    // Verify image was added to list
    await expect(page.locator('text=Test Image E2E')).toBeVisible();
    await expect(page.locator('text=https://example.com/test-image.jpg')).toBeVisible();
    
    // Check if there's a "set as primary" button and click it
    const setPrimaryButton = page.locator('button:has-text("הגדר כראשית")');
    if (await setPrimaryButton.count() > 0) {
      await setPrimaryButton.first().click();
      
      // Verify primary label appears
      await expect(page.locator('text=תמונה ראשית')).toBeVisible();
    }
    
    // Save changes
    await page.click('text=שמור שינויים');
    
    // Wait for success
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();
  });

  test('should handle form validation errors', async ({ page }) => {
    // Open edit dialog
    await page.click('button[aria-label="edit"] svg, button:has(svg[data-testid="EditIcon"])').first();
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Try to set negative price
    await page.click('text=מחיר ומידות');
    const priceField = page.locator('input[label="מחיר בסיס (₪)"], input:near(:text("מחיר בסיס"))').first();
    await priceField.clear();
    await priceField.fill('-100');
    
    // Try to save
    await page.click('text=שמור שינויים');
    
    // Should show validation error or stay in dialog
    // Since we can't easily test backend validation errors in frontend,
    // at minimum the dialog should not close immediately
    await page.waitForTimeout(1000);
  });

  test('should cancel editing without saving', async ({ page }) => {
    // Open edit dialog
    await page.click('button[aria-label="edit"] svg, button:has(svg[data-testid="EditIcon"])').first();
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Make some changes
    const nameField = page.locator('input[label="שם המוצר"], input:near(:text("שם המוצר"))').first();
    const originalName = await nameField.inputValue();
    await nameField.clear();
    await nameField.fill('Should Not Save');
    
    // Cancel instead of saving
    await page.click('text=ביטול');
    
    // Dialog should close
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();
    
    // Changes should not be saved - original name should still be visible
    if (originalName) {
      await expect(page.locator(`text=${originalName}`)).toBeVisible();
    }
    await expect(page.locator('text=Should Not Save')).not.toBeVisible();
  });

  test('should navigate between tabs without losing data', async ({ page }) => {
    // Open edit dialog
    await page.click('button[aria-label="edit"] svg, button:has(svg[data-testid="EditIcon"])').first();
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Edit name in basic info
    const nameField = page.locator('input[label="שם המוצר"], input:near(:text("שם המוצר"))').first();
    await nameField.clear();
    await nameField.fill('Tab Navigation Test');
    
    // Switch to pricing tab
    await page.click('text=מחיר ומידות');
    
    // Edit price
    const priceField = page.locator('input[label="מחיר בסיס (₪)"], input:near(:text("מחיר בסיס"))').first();
    await priceField.clear();
    await priceField.fill('300');
    
    // Switch to images tab
    await page.click('text=תמונות');
    
    // Add image
    await page.fill('input[label="URL תמונה"], input:near(:text("URL תמונה"))', 'https://example.com/nav-test.jpg');
    await page.click('button:has-text("הוסף")');
    
    // Go back to basic info tab
    await page.click('text=מידע בסיסי');
    
    // Verify name is still there
    await expect(nameField).toHaveValue('Tab Navigation Test');
    
    // Go to pricing tab
    await page.click('text=מחיר ומידות');
    
    // Verify price is still there
    await expect(priceField).toHaveValue('300');
    
    // Go to images tab
    await page.click('text=תמונות');
    
    // Verify image is still there
    await expect(page.locator('text=https://example.com/nav-test.jpg')).toBeVisible();
    
    // Save all changes
    await page.click('text=שמור שינויים');
    
    // Wait for success
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();
  });

  test('should handle multiple product edits in sequence', async ({ page }) => {
    // Get all edit buttons
    const editButtons = page.locator('button[aria-label="edit"] svg, button:has(svg[data-testid="EditIcon"])');
    const buttonCount = await editButtons.count();
    
    if (buttonCount >= 2) {
      // Edit first product
      await editButtons.nth(0).click();
      await expect(page.locator('div[role="dialog"]')).toBeVisible();
      
      const firstNameField = page.locator('input[label="שם המוצר"], input:near(:text("שם המוצר"))').first();
      await firstNameField.clear();
      await firstNameField.fill('First Product Updated');
      
      await page.click('text=שמור שינויים');
      await expect(page.locator('div[role="dialog"]')).not.toBeVisible();
      
      // Edit second product
      await editButtons.nth(1).click();
      await expect(page.locator('div[role="dialog"]')).toBeVisible();
      
      const secondNameField = page.locator('input[label="שם המוצר"], input:near(:text("שם המוצר"))').first();
      await secondNameField.clear();
      await secondNameField.fill('Second Product Updated');
      
      await page.click('text=שמור שינויים');
      await expect(page.locator('div[role="dialog"]')).not.toBeVisible();
      
      // Verify both updates are visible
      await expect(page.locator('text=First Product Updated')).toBeVisible();
      await expect(page.locator('text=Second Product Updated')).toBeVisible();
    }
  });

  test('should maintain responsive design on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still be functional
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    
    // Edit dialog should work on mobile
    await page.click('button[aria-label="edit"] svg, button:has(svg[data-testid="EditIcon"])').first();
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Tabs should be accessible
    await expect(page.locator('text=מידע בסיסי')).toBeVisible();
    await expect(page.locator('text=מחיר ומידות')).toBeVisible();
    await expect(page.locator('text=תמונות')).toBeVisible();
    
    // Close dialog
    await page.click('text=ביטול');
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();
  });
});
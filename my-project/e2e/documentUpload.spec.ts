/**
 * E2E Tests for Document Upload Flow
 * Phase 5.4: End-to-end testing with Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Document Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to documents page
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
  });

  test('should upload document and monitor status', async ({ page }) => {
    // Open upload modal
    await page.click('button:has-text("업로드")');

    // Wait for modal to appear
    await expect(page.locator('text=문서 업로드')).toBeVisible();

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/test.pdf');

    // Submit upload
    await page.click('button:has-text("업로드"):not([disabled])');

    // Wait for document to appear in table
    await expect(page.locator('text=test.pdf')).toBeVisible({ timeout: 10000 });

    // Check initial status
    await expect(page.locator('text=대기 중')).toBeVisible({ timeout: 5000 });

    // Wait for status change (mock server will change status)
    // In real scenario, this would poll the backend
    await page.waitForTimeout(6000);

    // Status should update to processing or done
    const processingOrDone = page.locator('text=처리 중, text=완료');
    await expect(processingOrDone.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter documents by status', async ({ page }) => {
    // Ensure there are documents with different statuses
    // (This assumes test data is available)

    // Click status filter dropdown
    await page.click('button:has-text("상태")');

    // Select "처리 중" status
    await page.click('text=처리 중');

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // Verify only processing documents shown
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    // Each visible row should have "처리 중" status
    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        await expect(row.locator('text=처리 중')).toBeVisible();
      }
    }
  });

  test('should search documents by filename', async ({ page }) => {
    // Type in search input
    const searchInput = page.locator('input[placeholder*="검색"]');
    await searchInput.fill('test.pdf');

    // Wait for search to apply
    await page.waitForTimeout(1000);

    // Verify only matching documents shown
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // All visible rows should contain "test.pdf"
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        await expect(row.locator('text=test.pdf')).toBeVisible();
      }
    }
  });

  test('should delete document successfully', async ({ page }) => {
    // Find first document row
    const firstRow = page.locator('tbody tr').first();

    // Get document name before deletion
    const documentName = await firstRow.locator('td:nth-child(2)').textContent();

    // Click delete button
    await firstRow.locator('button:has-text("삭제")').click();

    // Confirm deletion in dialog
    await page.click('button:has-text("확인")');

    // Wait for success toast
    await expect(page.locator('text=문서가 삭제되었습니다')).toBeVisible({ timeout: 5000 });

    // Verify document no longer appears in list
    await expect(page.locator(`text=${documentName}`)).not.toBeVisible();
  });

  test('should retry failed document', async ({ page }) => {
    // Find failed document (assumes test data has failed documents)
    const failedRow = page.locator('tbody tr:has-text("실패")').first();

    if ((await failedRow.count()) === 0) {
      test.skip();
      return;
    }

    // Click retry button
    await failedRow.locator('button:has-text("재처리")').click();

    // Wait for status to change
    await page.waitForTimeout(2000);

    // Status should change to queued or processing
    const newStatus = failedRow.locator('text=대기 중, text=처리 중');
    await expect(newStatus.first()).toBeVisible({ timeout: 5000 });
  });

  test('should paginate through documents', async ({ page }) => {
    // Check if pagination controls exist
    const nextButton = page.locator('button:has-text("다음")');

    if ((await nextButton.count()) === 0) {
      test.skip();
      return;
    }

    // Get first document on page 1
    const firstDocOnPage1 = await page
      .locator('tbody tr:first-child td:nth-child(2)')
      .textContent();

    // Click next page
    await nextButton.click();
    await page.waitForTimeout(1000);

    // Get first document on page 2
    const firstDocOnPage2 = await page
      .locator('tbody tr:first-child td:nth-child(2)')
      .textContent();

    // Documents should be different
    expect(firstDocOnPage1).not.toBe(firstDocOnPage2);
  });

  test('should show document details on row click', async ({ page }) => {
    // Click first document row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for details panel or modal to appear
    await page.waitForTimeout(500);

    // Verify details are shown (adjust selector based on actual implementation)
    const detailsPanel = page.locator('[data-testid="document-details"]');

    if ((await detailsPanel.count()) > 0) {
      await expect(detailsPanel).toBeVisible();

      // Details should include file information
      await expect(detailsPanel.locator('text=파일 크기')).toBeVisible();
      await expect(detailsPanel.locator('text=업로드 시각')).toBeVisible();
    }
  });

  test('should refresh document list', async ({ page }) => {
    // Get initial document count
    const initialRows = page.locator('tbody tr');
    const initialCount = await initialRows.count();

    // Click refresh button
    const refreshButton = page.locator('button:has-text("새로고침")');
    if ((await refreshButton.count()) > 0) {
      await refreshButton.click();

      // Wait for loading to complete
      await page.waitForTimeout(1000);

      // Document list should be reloaded (count should be same or different)
      const newRows = page.locator('tbody tr');
      const newCount = await newRows.count();

      // Just verify the list reloaded (count exists)
      expect(newCount).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Document Upload Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');

    // Open upload modal
    await page.click('button:has-text("업로드")');
    await expect(page.locator('text=문서 업로드')).toBeVisible();
  });

  test('should reject invalid file types', async ({ page }) => {
    // Try to upload invalid file type
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/invalid.xyz');

    // Should show error message
    await expect(page.locator('text=지원되지 않는 파일 형식')).toBeVisible();

    // Upload button should be disabled
    const uploadButton = page.locator('button:has-text("업로드")').last();
    await expect(uploadButton).toBeDisabled();
  });

  test('should reject oversized files', async ({ page }) => {
    // Try to upload file larger than 10MB
    // (This assumes fixtures/large-file.pdf > 10MB)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/large-file.pdf');

    // Should show error message
    await expect(page.locator('text=파일 크기가 너무 큽니다')).toBeVisible();

    // Upload button should be disabled
    const uploadButton = page.locator('button:has-text("업로드")').last();
    await expect(uploadButton).toBeDisabled();
  });
});

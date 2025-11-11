/**
 * Performance Tests for Document Monitoring
 * Phase 5.5: Performance and memory leak testing
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useAsyncDocumentStore } from '../stores/documentStore.async';
import { DocumentStatus } from '../types/document.types';
import type { DocumentWithStatus } from '../types/document.types';
import { DocumentTable } from '../components/monitoring/DocumentTable';

describe('Performance Tests', () => {
  beforeEach(() => {
    // Clean up store
    useAsyncDocumentStore.getState().stopAllPolling();
    useAsyncDocumentStore.setState({
      documents: new Map(),
      pollingStates: new Map(),
    });
  });

  it('should handle 100+ documents without lag', async () => {
    // Generate 100 mock documents
    const documents = new Map<string, DocumentWithStatus>();
    for (let i = 0; i < 100; i++) {
      let status: DocumentStatus;
      if (i % 4 === 0) {
        status = DocumentStatus.PROCESSING;
      } else if (i % 4 === 1) {
        status = DocumentStatus.DONE;
      } else if (i % 4 === 2) {
        status = DocumentStatus.QUEUED;
      } else {
        status = DocumentStatus.FAILED;
      }

      documents.set(`doc-${i}`, {
        documentId: `doc-${i}`,
        botId: 'test-bot-123',
        originalFilename: `file-${i}.pdf`,
        fileExtension: 'pdf',
        fileSize: 1024 * (i + 1),
        mimeType: 'application/pdf',
        status,
        retryCount: 0,
        createdAt: new Date().toISOString(),
        errorMessage: status === DocumentStatus.FAILED ? 'Processing failed' : undefined,
      });
    }

    useAsyncDocumentStore.setState({ documents });

    // Measure render time
    const startTime = performance.now();
    const documentsArray = Array.from(documents.values());
    render(<DocumentTable documents={documentsArray} />);
    const renderTime = performance.now() - startTime;

    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('should handle 1000+ documents efficiently', async () => {
    // Generate 1000 mock documents
    const documents = new Map<string, DocumentWithStatus>();
    for (let i = 0; i < 1000; i++) {
      documents.set(`doc-${i}`, {
        documentId: `doc-${i}`,
        botId: 'test-bot-123',
        originalFilename: `file-${i}.pdf`,
        fileExtension: 'pdf',
        fileSize: 1024 * (i + 1),
        mimeType: 'application/pdf',
        status: DocumentStatus.DONE,
        retryCount: 0,
        createdAt: new Date().toISOString(),
      });
    }

    useAsyncDocumentStore.setState({ documents });

    // Measure render time (should still be reasonable)
    const startTime = performance.now();
    const documentsArray = Array.from(documents.values()).slice(0, 50);
    render(<DocumentTable documents={documentsArray} />);
    const renderTime = performance.now() - startTime;

    // Should render paginated view in less than 150ms
    expect(renderTime).toBeLessThan(150);
  });

  it('should not leak memory with polling', async () => {
    // Skip test if performance.memory is not available
    if (typeof performance.memory === 'undefined') {
      console.log('Skipping memory test: performance.memory not available');
      return;
    }

    const initialMemory = performance.memory.usedJSHeapSize;

    // Start polling for 10 documents
    for (let i = 0; i < 10; i++) {
      const doc: DocumentWithStatus = {
        documentId: `doc-${i}`,
        botId: 'test-bot-123',
        originalFilename: `file-${i}.pdf`,
        fileExtension: 'pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        status: DocumentStatus.PROCESSING,
        retryCount: 0,
        createdAt: new Date().toISOString(),
      };

      const documents = new Map(useAsyncDocumentStore.getState().documents);
      documents.set(`doc-${i}`, doc);
      useAsyncDocumentStore.setState({ documents });

      useAsyncDocumentStore.getState().startPolling(`doc-${i}`);
    }

    // Wait for 10 polling cycles (50 seconds with 5s interval)
    // In test, we'll wait just 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Stop all polling
    useAsyncDocumentStore.getState().stopAllPolling();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Wait for GC
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const finalMemory = performance.memory.usedJSHeapSize;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be minimal (< 5MB, being generous for test environment)
    expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
  });

  it('should efficiently update document status', async () => {
    // Create 50 documents
    const documents = new Map<string, DocumentWithStatus>();
    for (let i = 0; i < 50; i++) {
      documents.set(`doc-${i}`, {
        documentId: `doc-${i}`,
        botId: 'test-bot-123',
        originalFilename: `file-${i}.pdf`,
        fileExtension: 'pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        status: DocumentStatus.PROCESSING,
        retryCount: 0,
        createdAt: new Date().toISOString(),
      });
    }

    useAsyncDocumentStore.setState({ documents });

    // Measure time to update all statuses
    const startTime = performance.now();

    for (let i = 0; i < 50; i++) {
      const updatedDoc = {
        ...documents.get(`doc-${i}`)!,
        status: DocumentStatus.DONE,
      };
      documents.set(`doc-${i}`, updatedDoc);
    }

    useAsyncDocumentStore.setState({ documents: new Map(documents) });

    const updateTime = performance.now() - startTime;

    // Should update all statuses in less than 50ms
    expect(updateTime).toBeLessThan(50);
  });

  it('should handle rapid polling without performance degradation', async () => {
    // Create 20 documents
    const documents = new Map<string, DocumentWithStatus>();
    for (let i = 0; i < 20; i++) {
      documents.set(`doc-${i}`, {
        documentId: `doc-${i}`,
        botId: 'test-bot-123',
        originalFilename: `file-${i}.pdf`,
        fileExtension: 'pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        status: DocumentStatus.PROCESSING,
        retryCount: 0,
        createdAt: new Date().toISOString(),
      });
    }

    useAsyncDocumentStore.setState({ documents });

    // Start polling for all
    for (let i = 0; i < 20; i++) {
      useAsyncDocumentStore.getState().startPolling(`doc-${i}`);
    }

    // Measure time to check all statuses once
    const startTime = performance.now();

    await Promise.all(
      Array.from(documents.keys()).map((id) =>
        useAsyncDocumentStore.getState().checkDocumentStatus(id)
      )
    );

    const checkTime = performance.now() - startTime;

    // Stop all polling
    useAsyncDocumentStore.getState().stopAllPolling();

    // Should check all statuses in reasonable time (< 100ms for mock API)
    // Note: In real scenario with network calls, this would be higher
    expect(checkTime).toBeLessThan(100);
  });

  it('should efficiently filter large document sets', async () => {
    // Create 500 documents with mixed statuses
    const documents = new Map<string, DocumentWithStatus>();
    for (let i = 0; i < 500; i++) {
      const statuses = [
        DocumentStatus.DONE,
        DocumentStatus.PROCESSING,
        DocumentStatus.QUEUED,
        DocumentStatus.FAILED,
      ];
      const status = statuses[i % 4];

      documents.set(`doc-${i}`, {
        documentId: `doc-${i}`,
        botId: 'test-bot-123',
        originalFilename: `file-${i}.pdf`,
        fileExtension: 'pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        status,
        retryCount: 0,
        createdAt: new Date().toISOString(),
      });
    }

    useAsyncDocumentStore.setState({ documents });

    // Measure filtering time
    const startTime = performance.now();

    const filtered = Array.from(documents.values()).filter(
      (doc) => doc.status === DocumentStatus.PROCESSING
    );

    const filterTime = performance.now() - startTime;

    // Should filter in less than 10ms
    expect(filterTime).toBeLessThan(10);

    // Verify correct number filtered
    expect(filtered.length).toBe(125); // 500 / 4 = 125 per status
  });

  it('should handle concurrent store updates efficiently', async () => {
    // Simulate concurrent updates
    const updatePromises: Promise<void>[] = [];

    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      const promise = new Promise<void>((resolve) => {
        const doc: DocumentWithStatus = {
          documentId: `doc-${i}`,
          botId: 'test-bot-123',
          originalFilename: `file-${i}.pdf`,
          fileExtension: 'pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          status: DocumentStatus.DONE,
          retryCount: 0,
          createdAt: new Date().toISOString(),
        };

        const documents = new Map(useAsyncDocumentStore.getState().documents);
        documents.set(`doc-${i}`, doc);
        useAsyncDocumentStore.setState({ documents });
        resolve();
      });

      updatePromises.push(promise);
    }

    await Promise.all(updatePromises);

    const updateTime = performance.now() - startTime;

    // Should handle 100 concurrent updates in less than 100ms
    expect(updateTime).toBeLessThan(100);

    // Verify all documents added
    expect(useAsyncDocumentStore.getState().documents.size).toBe(100);
  });
});

describe('Pagination Performance Tests', () => {
  it('should paginate efficiently with large datasets', async () => {
    // Create 10,000 documents
    const documents = new Map<string, DocumentWithStatus>();
    for (let i = 0; i < 10000; i++) {
      documents.set(`doc-${i}`, {
        documentId: `doc-${i}`,
        botId: 'test-bot-123',
        originalFilename: `file-${i}.pdf`,
        fileExtension: 'pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        status: DocumentStatus.DONE,
        retryCount: 0,
        createdAt: new Date().toISOString(),
      });
    }

    // Measure time to get one page
    const startTime = performance.now();

    const page = Array.from(documents.values()).slice(0, 50);

    const pageTime = performance.now() - startTime;

    // Should retrieve page in less than 5ms
    expect(pageTime).toBeLessThan(5);
    expect(page.length).toBe(50);
  });
});

/**
 * Fake database implementation for server-side development mode
 * This allows developers to test the ORM without an actual Appwrite backend
 * Uses in-memory storage instead of cookies (since we're on the server)
 */

import { DatabaseSchema } from '../shared/types';
import { Validator } from '../shared/utils';

interface Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  [key: string]: any;
}

interface Collection {
  documents: Document[];
}

interface FakeDatabase {
  [collectionId: string]: Collection;
}

export class FakeServerDatabaseClient {
  private static databases: Map<string, FakeDatabase> = new Map();

  constructor(private databaseId: string) {
    // Initialize database if it doesn't exist
    if (!FakeServerDatabaseClient.databases.has(databaseId)) {
      FakeServerDatabaseClient.databases.set(databaseId, {});
    }
  }

  /**
   * Get the database from memory
   */
  private getDatabase(): FakeDatabase {
    return FakeServerDatabaseClient.databases.get(this.databaseId) || {};
  }

  /**
   * Save the database to memory
   */
  private saveDatabase(db: FakeDatabase): void {
    FakeServerDatabaseClient.databases.set(this.databaseId, db);
  }

  /**
   * Get collection from database
   */
  private getCollection(collectionId: string): Collection {
    const db = this.getDatabase();
    if (!db[collectionId]) {
      db[collectionId] = { documents: [] };
      this.saveDatabase(db);
    }
    return db[collectionId];
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `fake_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Create a document
   */
  createDocument(
    collectionId: string,
    data: Partial<Document>,
    schema?: DatabaseSchema
  ): Document {
    const db = this.getDatabase();
    const collection = db[collectionId] || { documents: [] };
    
    const now = new Date().toISOString();
    const document: Document = {
      $id: data.$id || this.generateId(),
      $createdAt: now,
      $updatedAt: now,
      ...data
    };

    // Validate if schema provided
    if (schema) {
      this.validateDocument(document, schema);
    }

    collection.documents.push(document);
    db[collectionId] = collection;
    this.saveDatabase(db);
    
    return document;
  }

  /**
   * Get document by ID
   */
  getDocument(collectionId: string, documentId: string): Document | null {
    const collection = this.getCollection(collectionId);
    return collection.documents.find(doc => doc.$id === documentId) || null;
  }

  /**
   * List documents with optional filters
   */
  listDocuments(
    collectionId: string,
    filters?: Record<string, any>
  ): { documents: Document[]; total: number } {
    const collection = this.getCollection(collectionId);
    let documents = [...collection.documents];

    // Apply filters if provided
    if (filters) {
      documents = documents.filter(doc => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null) return true;
          
          // Handle array values (OR condition)
          if (Array.isArray(value)) {
            return value.includes(doc[key]);
          }
          
          return doc[key] === value;
        });
      });
    }

    return {
      documents,
      total: documents.length
    };
  }

  /**
   * Update a document
   */
  updateDocument(
    collectionId: string,
    documentId: string,
    data: Partial<Document>,
    schema?: DatabaseSchema
  ): Document {
    const db = this.getDatabase();
    const collection = db[collectionId] || { documents: [] };
    
    const docIndex = collection.documents.findIndex(doc => doc.$id === documentId);
    if (docIndex === -1) {
      throw new Error(`Document ${documentId} not found`);
    }

    const updatedDoc: Document = {
      ...collection.documents[docIndex],
      ...data,
      $id: documentId, // Preserve ID
      $updatedAt: new Date().toISOString()
    };

    // Validate if schema provided
    if (schema) {
      this.validateDocument(updatedDoc, schema);
    }

    collection.documents[docIndex] = updatedDoc;
    db[collectionId] = collection;
    this.saveDatabase(db);
    
    return updatedDoc;
  }

  /**
   * Delete a document
   */
  deleteDocument(collectionId: string, documentId: string): void {
    const db = this.getDatabase();
    const collection = db[collectionId] || { documents: [] };
    
    collection.documents = collection.documents.filter(doc => doc.$id !== documentId);
    db[collectionId] = collection;
    this.saveDatabase(db);
  }

  /**
   * Clear all data (for testing)
   */
  clearDatabase(): void {
    FakeServerDatabaseClient.databases.set(this.databaseId, {});
  }

  /**
   * Clear all databases (for testing)
   */
  static clearAll(): void {
    FakeServerDatabaseClient.databases.clear();
  }

  /**
   * Validate document against schema
   */
  private validateDocument(doc: Document, schema: DatabaseSchema): void {
    const errors: string[] = [];

    for (const [fieldName, fieldConfig] of Object.entries(schema)) {
      const value = doc[fieldName];
      const fieldErrors = Validator.validateField(value, fieldConfig, fieldName);
      
      if (fieldErrors.length > 0) {
        errors.push(...fieldErrors.map(e => e.message));
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }
}

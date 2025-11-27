import { Databases } from 'appwrite';
import { DatabaseSchema } from '../shared/types';
import { BaseTable, SchemaToType } from '../shared/table';
import { WebValidator } from './validator';

export class WebTable<T extends DatabaseSchema, TInterface = SchemaToType<T>> extends BaseTable<T, TInterface> {
  constructor(
    databases: Databases,
    databaseId: string,
    collectionId: string,
    schema: T,
    client?: any,
    config?: any
  ) {
    super(databases, databaseId, collectionId, schema, client, config);
  }

  /**
   * Override validation to use WebValidator
   */
  protected validateData(data: any, requireAll: boolean = false): void {
    WebValidator.validateAndThrow(data, this.schema, requireAll);
  }

  /**
   * Export all documents in this table to JSON
   * Fetches all documents in batches to handle large collections
   */
  async exportToJSON(): Promise<string> {
    const documents = await this.exportToArray();
    return JSON.stringify(documents, null, 2);
  }

  /**
   * Export all documents in this table as an array
   * Fetches all documents in batches to handle large collections
   */
  async exportToArray(): Promise<TInterface[]> {
    const allDocuments: TInterface[] = [];
    let offset = 0;
    const limit = 100; // Fetch in batches of 100
    let hasMore = true;

    while (hasMore) {
      const batch = await this.query(undefined, { limit, offset });
      allDocuments.push(...batch);
      
      if (batch.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    return allDocuments;
  }
}
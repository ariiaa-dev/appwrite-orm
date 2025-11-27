/**
 * Tests for data export functionality
 */

import { ServerORM } from '../src/server';
import { FakeServerDatabaseClient } from '../src/server/fake-database';

const userTable = {
  name: 'users',
  schema: {
    name: { type: 'string' as const, required: true },
    email: { type: 'string' as const, required: true },
    age: { type: 'number' as const, required: false }
  }
};

const postTable = {
  name: 'posts',
  schema: {
    title: { type: 'string' as const, required: true },
    content: { type: 'string' as const, required: true },
    authorId: { type: 'string' as const, required: true }
  }
};

describe('Data Export', () => {
  let orm: ServerORM;
  let db: any;

  beforeEach(async () => {
    // Clear all data before each test
    FakeServerDatabaseClient.clearAll();

    orm = new ServerORM({
      endpoint: 'http://localhost',
      projectId: 'test-project',
      databaseId: 'test-db',
      development: true
    });

    db = await orm.init([userTable, postTable]);
  });

  afterEach(() => {
    db.closeListeners();
    FakeServerDatabaseClient.clearAll();
  });

  describe('Table Export', () => {
    it('should export table to JSON string', async () => {
      // Create test data
      await db.table('users').create({
        name: 'Alice',
        email: 'alice@example.com',
        age: 28
      });

      await db.table('users').create({
        name: 'Bob',
        email: 'bob@example.com',
        age: 35
      });

      // Export to JSON
      const json = await db.table('users').exportToJSON();

      // Verify it's a valid JSON string
      expect(typeof json).toBe('string');
      
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
      expect(parsed[0].name).toBe('Alice');
      expect(parsed[1].name).toBe('Bob');
    });

    it('should export table to array', async () => {
      // Create test data
      await db.table('users').create({
        name: 'Charlie',
        email: 'charlie@example.com',
        age: 22
      });

      // Export to array
      const users = await db.table('users').exportToArray();

      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(1);
      expect(users[0].name).toBe('Charlie');
      expect(users[0].email).toBe('charlie@example.com');
      expect(users[0].$id).toBeDefined();
    });

    it('should export empty table', async () => {
      const users = await db.table('users').exportToArray();
      expect(users.length).toBe(0);

      const json = await db.table('users').exportToJSON();
      const parsed = JSON.parse(json);
      expect(parsed.length).toBe(0);
    });
  });

  describe('Database Export', () => {
    it('should export all tables to JSON', async () => {
      // Create test data
      const user = await db.table('users').create({
        name: 'Alice',
        email: 'alice@example.com'
      });

      await db.table('posts').create({
        title: 'Test Post',
        content: 'Content here',
        authorId: user.$id
      });

      // Export all tables
      const json = await db.exportDataToJSON();

      expect(typeof json).toBe('string');
      
      const parsed = JSON.parse(json);
      expect(parsed.users).toBeDefined();
      expect(parsed.posts).toBeDefined();
      expect(parsed.users.length).toBe(1);
      expect(parsed.posts.length).toBe(1);
    });

    it('should export all tables to object', async () => {
      // Create test data
      await db.table('users').create({
        name: 'Bob',
        email: 'bob@example.com'
      });

      await db.table('users').create({
        name: 'Charlie',
        email: 'charlie@example.com'
      });

      // Export to object
      const data = await db.exportDataToObject();

      expect(typeof data).toBe('object');
      expect(data.users).toBeDefined();
      expect(data.posts).toBeDefined();
      expect(Array.isArray(data.users)).toBe(true);
      expect(Array.isArray(data.posts)).toBe(true);
      expect(data.users.length).toBe(2);
      expect(data.posts.length).toBe(0);
    });

    it('should export specific tables to JSON', async () => {
      // Create test data
      await db.table('users').create({
        name: 'Alice',
        email: 'alice@example.com'
      });

      await db.table('posts').create({
        title: 'Post 1',
        content: 'Content',
        authorId: 'user123'
      });

      // Export only users table
      const json = await db.exportTablesDataToJSON(['users']);

      const parsed = JSON.parse(json);
      expect(parsed.users).toBeDefined();
      expect(parsed.posts).toBeUndefined();
      expect(parsed.users.length).toBe(1);
    });

    it('should export specific tables to object', async () => {
      // Create test data
      await db.table('users').create({
        name: 'Bob',
        email: 'bob@example.com'
      });

      await db.table('posts').create({
        title: 'Post 1',
        content: 'Content',
        authorId: 'user123'
      });

      // Export specific tables
      const data = await db.exportTablesDataToObject(['posts']);

      expect(data.posts).toBeDefined();
      expect(data.users).toBeUndefined();
      expect(data.posts.length).toBe(1);
    });

    it('should throw error for non-existent table', async () => {
      await expect(
        db.exportTablesDataToJSON(['nonexistent'])
      ).rejects.toThrow("Table 'nonexistent' not found");
    });
  });

  describe('Export with Multiple Documents', () => {
    it('should export large number of documents', async () => {
      // Create 50 users
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          db.table('users').create({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            age: 20 + i
          })
        );
      }
      await Promise.all(promises);

      // Export
      const users = await db.table('users').exportToArray();
      expect(users.length).toBe(50);

      // Verify data integrity
      const json = await db.table('users').exportToJSON();
      const parsed = JSON.parse(json);
      expect(parsed.length).toBe(50);
      expect(parsed[0].name).toBe('User 0');
      expect(parsed[49].name).toBe('User 49');
    });
  });

  describe('Export Data Integrity', () => {
    it('should preserve all document fields', async () => {
      const user = await db.table('users').create({
        name: 'Test User',
        email: 'test@example.com',
        age: 30
      });

      const exported = await db.table('users').exportToArray();
      const exportedUser = exported[0];

      expect(exportedUser.$id).toBe(user.$id);
      expect(exportedUser.name).toBe(user.name);
      expect(exportedUser.email).toBe(user.email);
      expect(exportedUser.age).toBe(user.age);
      expect(exportedUser.$createdAt).toBeDefined();
      expect(exportedUser.$updatedAt).toBeDefined();
    });

    it('should handle documents with missing optional fields', async () => {
      await db.table('users').create({
        name: 'User Without Age',
        email: 'noage@example.com'
        // age is optional and not provided
      });

      const users = await db.table('users').exportToArray();
      expect(users.length).toBe(1);
      expect(users[0].name).toBe('User Without Age');
      expect(users[0].age).toBeUndefined();
    });
  });
});

# Exporting Data

Export database data to JSON format for backups, migrations, or analysis.

## Table Export

```typescript
// Export single table to JSON string
const json = await db.table('users').exportToJSON();

// Export single table to array
const users = await db.table('users').exportToArray();
```

## Database Export

```typescript
// Export all tables to JSON
const json = await db.exportDataToJSON();

// Export all tables to object
const data = await db.exportDataToObject();
// { users: [...], posts: [...] }

// Export specific tables
const json = await db.exportTablesDataToJSON(['users', 'posts']);
const data = await db.exportTablesDataToObject(['users', 'posts']);
```

## Save to File

```typescript
import * as fs from 'fs';

const data = await db.exportDataToJSON();
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(`backup-${timestamp}.json`, data);
```

## Backup Script

```typescript
async function backupDatabase() {
  const orm = new ServerORM({
    endpoint: process.env.APPWRITE_ENDPOINT!,
    projectId: process.env.APPWRITE_PROJECT_ID!,
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const db = await orm.init([userTable, postTable]);

  const data = await db.exportDataToJSON();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  fs.writeFileSync(`backups/backup-${timestamp}.json`, data);
  console.log('Backup created');
  
  db.closeListeners();
}
```

## Data Migration

```typescript
// Export from production
const prodDb = await prodOrm.init([userTable]);
const prodData = await prodDb.exportDataToObject();

// Import to staging
const stagingDb = await stagingOrm.init([userTable]);

for (const user of prodData.users) {
  const { $id, $createdAt, $updatedAt, ...userData } = user;
  await stagingDb.table('users').create(userData);
}
```

## Test Fixtures

```typescript
const testUsers = await db.table('users').query({ role: 'test' });
fs.writeFileSync('tests/fixtures/users.json', JSON.stringify(testUsers, null, 2));
```

## Performance

Export automatically handles pagination for large collections (100 documents per batch).

For very large datasets:

```typescript
// Export only recent data
const recentPosts = await db.table('posts').query(
  { published: true },
  { orderBy: ['-$createdAt'], limit: 1000 }
);
```

## Development Mode

Export works in development mode:

```typescript
const orm = new ServerORM({
  endpoint: 'http://localhost',
  projectId: 'dev',
  databaseId: 'test',
  development: true
});

const db = await orm.init([userTable]);
const data = await db.exportDataToJSON();
```

## Next Steps

- [Development Mode](development-mode.md) - Test without Appwrite backend
- [CRUD Operations](crud-operations.md) - Create, read, update, delete data
- [Queries](queries.md) - Filter and search data
- [Bulk Operations](bulk-operations.md) - Efficient batch operations

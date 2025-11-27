# Development Mode

Development mode allows server-side development without connecting to Appwrite. Data is stored in memory.

## Setup

```typescript
import { ServerORM } from 'appwrite-orm/server';

const orm = new ServerORM({
  endpoint: 'http://localhost',
  projectId: 'dev-project',
  databaseId: 'dev-db',
  development: true
});

const db = await orm.init([userTable, postTable]);
```

## Usage

All standard operations work the same:

```typescript
const user = await db.table('users').create({
  name: 'Alice',
  email: 'alice@example.com'
});

const users = await db.table('users').all();
const count = await db.table('users').count();
```

## Testing

```typescript
import { FakeServerDatabaseClient } from 'appwrite-orm/server';

describe('My Feature', () => {
  beforeEach(async () => {
    FakeServerDatabaseClient.clearAll();
    
    const orm = new ServerORM({
      endpoint: 'http://localhost',
      projectId: 'test',
      databaseId: 'test',
      development: true
    });
    
    db = await orm.init([userTable]);
  });

  afterEach(() => {
    db.closeListeners();
    FakeServerDatabaseClient.clearAll();
  });
});
```

## Environment Configuration

```typescript
const orm = new ServerORM({
  endpoint: process.env.APPWRITE_ENDPOINT || 'http://localhost',
  projectId: process.env.APPWRITE_PROJECT_ID || 'dev-project',
  databaseId: process.env.APPWRITE_DATABASE_ID || 'dev-db',
  apiKey: process.env.APPWRITE_API_KEY,
  development: process.env.NODE_ENV === 'development'
});
```

## Limitations

- Data stored in memory (lost on restart)
- Complex Appwrite queries not supported
- Not optimized for large datasets
- Realtime uses polling (1 second intervals)

## Exporting Data

Export data from development mode:

```typescript
// Export single table
const json = await db.table('users').exportToJSON();
const users = await db.table('users').exportToArray();

// Export all tables
const allData = await db.exportDataToJSON();
const dataObj = await db.exportDataToObject();

// Export specific tables
const json = await db.exportTablesDataToJSON(['users', 'posts']);

// Save to file
import * as fs from 'fs';
fs.writeFileSync('backup.json', allData);
```

Useful for creating test fixtures, debugging, or sharing sample data.

## Warning

Do not use in production. Development mode stores everything in memory.

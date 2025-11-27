# Exporting Data

Export database data to JSON format in the browser.

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

// Export specific tables
const json = await db.exportTablesDataToJSON(['users', 'posts']);
const data = await db.exportTablesDataToObject(['users', 'posts']);
```

## Download as File

```typescript
async function downloadData() {
  const data = await db.exportDataToJSON();
  
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-${new Date().toISOString()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}
```

## Development Mode

Export works in development mode:

```typescript
const orm = new WebORM({
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
- [CRUD Operations](crud-operations.md) - Basic operations
- [Queries](queries.md) - Query data

import { config } from 'dotenv';
import { ServerORM } from 'appwrite-orm/server';

// Load environment variables
config();

// Initialize ServerORM with configuration
const orm = new ServerORM({
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  apiKey: process.env.APPWRITE_API_KEY!,
  autoMigrate: true, // Automatically create/update collections
});

// Define the showcase table schema
const showcaseTable = {
  name: 'showcase',
  schema: {
    name: { type: 'string' as const, required: true },
    description: { type: 'string' as const, required: true },
    link: { type: 'string' as const, required: true },
    github: { type: 'string' as const, required: true },
    tags: { type: 'string' as const, array: true, required: true },
    approved: { type: 'boolean' as const, required: true, default: false },
    createdAt: { type: 'datetime' as const, required: true },
  }
};

// Define the requests table schema
const requestsTable = {
  name: 'requests',
  schema: {
    projectName: { type: 'string' as const, required: true },
    description: { type: 'string' as const, required: true },
    projectUrl: { type: 'string' as const, required: true },
    githubUrl: { type: 'string' as const, required: true },
    tags: { type: 'string' as const, required: true },
    contactEmail: { type: 'string' as const, required: true },
    status: { type: 'string' as const, required: true, default: 'pending' }, // pending, approved, rejected
    submittedAt: { type: 'datetime' as const, required: true },
  }
};

// Initialize the ORM with table definitions
export async function setupDatabase() {
  const db = await orm.init([showcaseTable, requestsTable]);
  return db;
}
const db = setupDatabase().catch(console.error);
export { db };

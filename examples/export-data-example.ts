/**
 * Example: Exporting Data from Appwrite ORM
 * 
 * This example demonstrates how to export data from your database
 * to JSON format. This is useful for:
 * - Backing up production data
 * - Migrating data between environments
 * - Creating test fixtures
 * - Data analysis and reporting
 */

import { ServerORM } from '../src/server';
import * as fs from 'fs';
import * as path from 'path';

// Define your schema
const userTable = {
  name: 'users',
  schema: {
    name: { type: 'string' as const, required: true },
    email: { type: 'string' as const, required: true },
    age: { type: 'number' as const, required: false },
    role: { type: 'string' as const, required: false, default: 'user' }
  }
};

const postTable = {
  name: 'posts',
  schema: {
    title: { type: 'string' as const, required: true },
    content: { type: 'string' as const, required: true },
    authorId: { type: 'string' as const, required: true },
    published: { type: 'boolean' as const, required: false, default: false },
    views: { type: 'number' as const, required: false, default: 0 }
  }
};

const commentTable = {
  name: 'comments',
  schema: {
    postId: { type: 'string' as const, required: true },
    authorId: { type: 'string' as const, required: true },
    content: { type: 'string' as const, required: true },
    likes: { type: 'number' as const, required: false, default: 0 }
  }
};

async function main() {
  console.log('📦 Appwrite ORM Data Export Example\n');

  // Initialize ORM in development mode (for demo purposes)
  const orm = new ServerORM({
    endpoint: 'http://localhost',
    projectId: 'export-demo',
    databaseId: 'main-db',
    development: true // Using development mode for this example
  });

  const db = await orm.init([userTable, postTable, commentTable]);
  console.log('✅ ORM initialized\n');

  // Create sample data
  console.log('📝 Creating sample data...');
  
  const user1 = await db.table('users').create({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 28,
    role: 'admin'
  });

  const user2 = await db.table('users').create({
    name: 'Bob Smith',
    email: 'bob@example.com',
    age: 35,
    role: 'user'
  });

  const user3 = await db.table('users').create({
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    age: 22,
    role: 'user'
  });

  const post1 = await db.table('posts').create({
    title: 'Getting Started with Appwrite',
    content: 'Appwrite is an amazing backend platform...',
    authorId: user1.$id,
    published: true,
    views: 150
  });

  const post2 = await db.table('posts').create({
    title: 'Advanced ORM Techniques',
    content: 'Learn how to use joins and complex queries...',
    authorId: user1.$id,
    published: true,
    views: 89
  });

  const post3 = await db.table('posts').create({
    title: 'Draft Post',
    content: 'This is a draft...',
    authorId: user2.$id,
    published: false,
    views: 0
  });

  await db.table('comments').create({
    postId: post1.$id,
    authorId: user2.$id,
    content: 'Great article!',
    likes: 5
  });

  await db.table('comments').create({
    postId: post1.$id,
    authorId: user3.$id,
    content: 'Very helpful, thanks!',
    likes: 3
  });

  await db.table('comments').create({
    postId: post2.$id,
    authorId: user3.$id,
    content: 'Looking forward to more content like this.',
    likes: 2
  });

  console.log('✅ Sample data created\n');

  // Example 1: Export a single table
  console.log('📤 Example 1: Export a single table');
  console.log('─────────────────────────────────────');
  const usersJSON = await db.table('users').exportToJSON();
  console.log('Users table exported:');
  console.log(usersJSON);
  console.log();

  // Example 2: Export a single table as an array
  console.log('📤 Example 2: Export as array for processing');
  console.log('─────────────────────────────────────────────');
  const postsArray = await db.table('posts').exportToArray();
  console.log(`Exported ${postsArray.length} posts`);
  
  // Process the data
  const publishedPosts = postsArray.filter(p => p.published);
  const totalViews = postsArray.reduce((sum, p) => sum + (p.views || 0), 0);
  console.log(`- Published posts: ${publishedPosts.length}`);
  console.log(`- Total views: ${totalViews}`);
  console.log();

  // Example 3: Export all tables at once
  console.log('📤 Example 3: Export entire database');
  console.log('─────────────────────────────────────');
  const allDataJSON = await db.exportDataToJSON();
  console.log('Full database export (first 500 chars):');
  console.log(allDataJSON.substring(0, 500) + '...\n');

  // Example 4: Export specific tables
  console.log('📤 Example 4: Export specific tables');
  console.log('─────────────────────────────────────');
  const specificTablesJSON = await db.exportTablesDataToJSON(['users', 'posts']);
  console.log('Users and Posts exported (first 500 chars):');
  console.log(specificTablesJSON.substring(0, 500) + '...\n');

  // Example 5: Export to file
  console.log('📤 Example 5: Export to file');
  console.log('─────────────────────────────────────');
  const exportDir = path.join(__dirname, 'exports');
  
  // Create exports directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Export full database to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fullExportPath = path.join(exportDir, `database-export-${timestamp}.json`);
  fs.writeFileSync(fullExportPath, allDataJSON);
  console.log(`✅ Full database exported to: ${fullExportPath}`);

  // Export individual tables to separate files
  const usersPath = path.join(exportDir, `users-${timestamp}.json`);
  fs.writeFileSync(usersPath, usersJSON);
  console.log(`✅ Users table exported to: ${usersPath}`);

  const postsJSON = await db.table('posts').exportToJSON();
  const postsPath = path.join(exportDir, `posts-${timestamp}.json`);
  fs.writeFileSync(postsPath, postsJSON);
  console.log(`✅ Posts table exported to: ${postsPath}`);

  // Example 6: Export as object for custom processing
  console.log('\n📤 Example 6: Export as object for custom processing');
  console.log('────────────────────────────────────────────────────');
  const dataObject = await db.exportDataToObject();
  
  console.log('Database statistics:');
  for (const [tableName, documents] of Object.entries(dataObject)) {
    console.log(`- ${tableName}: ${documents.length} documents`);
  }

  // Create a summary report
  const summary = {
    exportDate: new Date().toISOString(),
    tables: Object.keys(dataObject),
    totalDocuments: Object.values(dataObject).reduce((sum, docs) => sum + docs.length, 0),
    statistics: {
      users: {
        total: dataObject.users.length,
        admins: dataObject.users.filter((u: any) => u.role === 'admin').length,
        averageAge: dataObject.users.reduce((sum: number, u: any) => sum + (u.age || 0), 0) / dataObject.users.length
      },
      posts: {
        total: dataObject.posts.length,
        published: dataObject.posts.filter((p: any) => p.published).length,
        totalViews: dataObject.posts.reduce((sum: number, p: any) => sum + (p.views || 0), 0)
      },
      comments: {
        total: dataObject.comments.length,
        totalLikes: dataObject.comments.reduce((sum: number, c: any) => sum + (c.likes || 0), 0)
      }
    }
  };

  const summaryPath = path.join(exportDir, `summary-${timestamp}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`\n✅ Summary report exported to: ${summaryPath}`);

  console.log('\n📊 Summary:');
  console.log(JSON.stringify(summary, null, 2));

  // Clean up
  db.closeListeners();
  console.log('\n✅ Export examples completed successfully!');
}

// Run the example
main().catch(console.error);

/**
 * Script to list all pending project requests
 * Usage: npx tsx list-requests.ts
 */

import { config } from 'dotenv';
config();

import { setupDatabase } from './setup';

async function listRequests() {
  try {
    const db = await setupDatabase();

    // Get all pending requests
    const requests = await db.table('requests').query({ status: 'pending' });

    if (requests.length === 0) {
      console.log('No pending requests');
      return;
    }

    console.log(`\nFound ${requests.length} pending request(s):\n`);

    requests.forEach((request: any, index: number) => {
      console.log(`${index + 1}. ${request.projectName}`);
      console.log(`   ID: ${request.$id}`);
      console.log(`   Description: ${request.description}`);
      console.log(`   URL: ${request.projectUrl}`);
      console.log(`   GitHub: ${request.githubUrl}`);
      console.log(`   Tags: ${request.tags}`);
      console.log(`   Email: ${request.contactEmail}`);
      console.log(`   Submitted: ${new Date(request.submittedAt).toLocaleString()}`);
      console.log('');
    });

    console.log('To approve a request, run:');
    console.log('npx tsx approve-project.ts <request-id>');
  } catch (error: any) {
    console.error('Error listing requests:', error?.message || error);
    process.exit(1);
  }
}

listRequests();

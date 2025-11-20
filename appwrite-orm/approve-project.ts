/**
 * Script to approve a project request and add it to the showcase
 * Usage: npx tsx approve-project.ts <request-id>
 */

import { config } from 'dotenv';
config();

import { setupDatabase } from './setup';

async function approveProject(requestId: string) {
  try {
    const db = await setupDatabase();

    // Get the request
    const request = await db.table('requests').get(requestId);
    
    if (!request) {
      console.error('Request not found');
      process.exit(1);
    }

    if (request.status !== 'pending') {
      console.error(`Request is already ${request.status}`);
      process.exit(1);
    }

    console.log('Approving project:', request.projectName);

    // Create showcase entry
    await db.table('showcase').create({
      name: request.projectName,
      description: request.description,
      link: request.projectUrl,
      github: request.githubUrl,
      tags: request.tags.split(',').map((t: string) => t.trim()),
      approved: true,
      createdAt: new Date().toISOString(),
    } as any);

    // Update request status
    await db.table('requests').update(requestId, {
      status: 'approved',
    } as any);

    console.log('✓ Project approved and added to showcase!');
    console.log('Contact email:', request.contactEmail);
  } catch (error: any) {
    console.error('Error approving project:', error?.message || error);
    process.exit(1);
  }
}

// Get request ID from command line
const requestId = process.argv[2];

if (!requestId) {
  console.error('Usage: npx tsx approve-project.ts <request-id>');
  process.exit(1);
}

approveProject(requestId);

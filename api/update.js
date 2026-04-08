import { PrismaClient } from '@prisma/client';

// Helper function for retry with exponential backoff
async function retryWithBackoff(operation, maxRetries = 3, delayMs = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      // Only retry on connection errors
      if (!error.message.includes('db.prisma.io') && !error.message.includes('Failed to fetch')) {
        throw error; // Don't retry other errors
      }
      if (i < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, i); // exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export default async function handler(req, res) {
  const prisma = new PrismaClient();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, id, ...updateData } = req.body;

    if (!type || !id) {
      return res.status(400).json({
        success: false,
        error: 'type and id are required',
      });
    }

    let result;
    let resultKey;

    // Wrap database operations with retry logic
    await retryWithBackoff(async () => {
      switch (type) {
        case 'user':
          result = await prisma.user.update({
            where: { id },
            data: {
              ...(updateData.email && { email: updateData.email }),
              ...(updateData.name && { name: updateData.name }),
              ...(updateData.phone !== undefined && { phone: updateData.phone }),
              ...(updateData.avatar !== undefined && { avatar: updateData.avatar }),
              ...(updateData.themePreference && { themePreference: updateData.themePreference }),
            },
          });
          resultKey = 'user';
          break;

        case 'workspace':
          result = await prisma.workspace.update({
            where: { id },
            data: {
              ...(updateData.title && { title: updateData.title }),
              ...(updateData.color && { color: updateData.color }),
            },
            include: { user: true, columns: true },
          });
          resultKey = 'workspace';
          break;

        case 'column':
          result = await prisma.column.update({
            where: { id },
            data: {
              ...(updateData.title && { title: updateData.title }),
              ...(updateData.color && { color: updateData.color }),
              ...(updateData.position !== undefined && { position: updateData.position }),
            },
            include: { workspace: true, tasks: true },
          });
          resultKey = 'column';
          break;

        case 'task':
          result = await prisma.task.update({
            where: { id },
            data: {
              ...(updateData.title && { title: updateData.title }),
              ...(updateData.description !== undefined && { description: updateData.description }),
              ...(updateData.columnId && { columnId: updateData.columnId }),
              ...(updateData.priority && { priority: updateData.priority }),
              ...(updateData.deadline !== undefined && { deadline: updateData.deadline ? new Date(updateData.deadline) : null }),
              ...(updateData.cardColor && { cardColor: updateData.cardColor }),
              ...(updateData.completionComment !== undefined && { completionComment: updateData.completionComment }),
              ...(updateData.assignedTo !== undefined && { assignedTo: updateData.assignedTo }),
              ...(updateData.tags !== undefined && { tags: updateData.tags }),
              ...(updateData.subtasks !== undefined && { subtasks: updateData.subtasks }),
              ...(updateData.comments !== undefined && { comments: updateData.comments }),
            },
            include: { column: true },
          });
          resultKey = 'task';
          break;

        default:
          throw new Error(`Invalid type. Must be: user, workspace, column, or task`);
      }
    });

    const response = {
      success: true,
      message: `${type} updated successfully`,
      timestamp: new Date().toISOString(),
    };
    response[resultKey] = result;

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error updating:', error);
    // Check if it's a connection error after retries
    if (error.message.includes('db.prisma.io')) {
      return res.status(503).json({
        success: false,
        error: 'Database connection unavailable, please try again',
        retryable: true,
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
}

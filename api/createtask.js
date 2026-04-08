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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, columnId, workspaceId, description, priority, deadline, cardColor, subtasks } = req.body;

    if (!title || !columnId || !workspaceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, columnId, workspaceId',
      });
    }

    const task = await retryWithBackoff(async () => {
      const column = await prisma.column.findUnique({
        where: { id: columnId },
      });

      if (!column) {
        throw new Error('Column not found');
      }

      return await prisma.task.create({
        data: {
          title,
          columnId,
          workspaceId,
          description: description || null,
          priority: priority || 'Média',
          deadline: deadline ? new Date(deadline) : null,
          cardColor: cardColor || 'slate',
          subtasks: subtasks || [],
        },
        include: { column: true },
      });
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: task,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Check for specific errors
    if (error.message === 'Column not found') {
      return res.status(400).json({
        success: false,
        error: 'Column not found',
      });
    }
    
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

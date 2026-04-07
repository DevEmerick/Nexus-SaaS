import { PrismaClient } from '@prisma/client';

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
    const { title, columnId, description, priority, dueDate } = req.body;

    if (!title || !columnId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, columnId',
      });
    }

    const column = await prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      return res.status(400).json({
        success: false,
        error: 'Column not found',
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        columnId,
        description: description || null,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { column: true, comments: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
}

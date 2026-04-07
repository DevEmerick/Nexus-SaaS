import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  const prisma = new PrismaClient();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, id, permanent } = req.body;

    if (!type || !id) {
      return res.status(400).json({
        success: false,
        error: 'type and id are required',
      });
    }

    let result;

    switch (type) {
      case 'workspace':
        result = await prisma.workspace.delete({
          where: { id },
        });
        return res.status(200).json({
          success: true,
          message: 'Workspace deleted successfully',
          timestamp: new Date().toISOString(),
        });

      case 'column':
        result = await prisma.column.delete({
          where: { id },
        });
        return res.status(200).json({
          success: true,
          message: 'Column deleted successfully',
          timestamp: new Date().toISOString(),
        });

      case 'task':
        if (permanent) {
          result = await prisma.task.delete({
            where: { id },
          });
          return res.status(200).json({
            success: true,
            message: 'Task permanently deleted',
            timestamp: new Date().toISOString(),
          });
        } else {
          result = await prisma.task.update({
            where: { id },
            data: { deletedAt: new Date() },
          });
          return res.status(200).json({
            success: true,
            message: 'Task moved to trash',
            timestamp: new Date().toISOString(),
          });
        }

      default:
        return res.status(400).json({
          success: false,
          error: `Invalid type. Must be: workspace, column, or task`,
        });
    }
  } catch (error) {
    console.error('Error deleting:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
}

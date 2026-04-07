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
    let resultKey;

    switch (type) {
      case 'workspace':
        result = await prisma.workspace.delete({
          where: { id },
          include: { user: true, columns: true },
        });
        resultKey = 'workspace';
        break;

      case 'column':
        result = await prisma.column.delete({
          where: { id },
          include: { workspace: true, tasks: true },
        });
        resultKey = 'column';
        break;

      case 'task':
        if (permanent) {
          result = await prisma.task.delete({
            where: { id },
            include: { column: true },
          });
        } else {
          result = await prisma.task.update({
            where: { id },
            data: { deletedAt: new Date() },
            include: { column: true },
          });
        }
        resultKey = 'task';
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Invalid type. Must be: workspace, column, or task`,
        });
    }

    const response = {
      success: true,
      message: `${type} deleted successfully`,
      timestamp: new Date().toISOString(),
    };
    response[resultKey] = result;

    return res.status(200).json(response);
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

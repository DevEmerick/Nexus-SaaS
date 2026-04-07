import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // Apenas aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Deletar tudo
    const tasksDeleted = await prisma.task.deleteMany({});
    const columnsDeleted = await prisma.column.deleteMany({});
    const workspacesDeleted = await prisma.workspace.deleteMany({});
    const usersDeleted = await prisma.user.deleteMany({});

    return res.status(200).json({
      success: true,
      message: 'Database truncated successfully',
      deleted: {
        tasks: tasksDeleted.count,
        columns: columnsDeleted.count,
        workspaces: workspacesDeleted.count,
        users: usersDeleted.count
      }
    });
  } catch (error) {
    console.error('Truncate error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

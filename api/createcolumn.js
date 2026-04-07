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
    const { name, workspaceId, position } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, workspaceId',
      });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(400).json({
        success: false,
        error: 'Workspace not found',
      });
    }

    const column = await prisma.column.create({
      data: { name, workspaceId, position: position || 0 },
      include: { workspace: true, tasks: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Column created successfully',
      data: column,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating column:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
}

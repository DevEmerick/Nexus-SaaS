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
    const { title, color, userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, userId',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User not found',
      });
    }

    const workspace = await prisma.workspace.create({
      data: { 
        title, 
        userId, 
        color: color || '#3B82F6'
      },
      include: { user: true, columns: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      workspace: workspace,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
}

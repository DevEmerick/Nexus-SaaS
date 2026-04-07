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
    const { name, userId, description } = req.body;

    if (!name || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, userId',
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
      data: { name, userId, description: description || null },
      include: { user: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      data: workspace,
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

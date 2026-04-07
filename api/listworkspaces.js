import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  const prisma = new PrismaClient();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const workspaces = await prisma.workspace.findMany({
      include: { user: true, columns: true },
    });

    return res.status(200).json({
      success: true,
      count: workspaces.length,
      data: workspaces,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
}

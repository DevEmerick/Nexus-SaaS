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
    const users = await prisma.user.findMany({
      include: { workspaces: true },
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
}

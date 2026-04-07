import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  const prisma = new PrismaClient();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        status: 'API running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        database: process.env.DATABASE_URL ? 'configured' : 'missing',
        endpoints: {
          health: '/api/health (GET/POST)',
          listUsers: '/api/listusers (GET)',
          listWorkspaces: '/api/listworkspaces (GET)',
          listColumns: '/api/listcolumns (GET)',
          listTasks: '/api/listtasks (GET)',
          createUser: '/api/createuser (POST)',
          createWorkspace: '/api/createworkspace (POST)',
          createColumn: '/api/createcolumn (POST)',
          createTask: '/api/createtask (POST)',
        },
      });
    }

    if (req.method === 'POST') {
      const user = await prisma.user.create({
        data: {
          email: `user-${Date.now()}@vercel.db`,
          name: 'User from Vercel',
          password: 'test123',
        },
      });

      return res.status(201).json({
        success: true,
        message: 'SALVO NO BANCO VERCEL POSTGRES!',
        user: { id: user.id, email: user.email, name: user.name },
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Health endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
}


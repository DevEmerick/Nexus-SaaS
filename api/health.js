import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const path = req.url.split('?')[0];
  const params = new URL(`http://localhost${req.url}`).searchParams;
  const action = params.get('action');

  // GET /api/health - health status ou CRUD se action fornecida
  if (req.method === 'GET') {
    if (!action) {
      // Health check padrão
      return res.status(200).json({ 
        status: 'API running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        database: process.env.DATABASE_URL ? 'configured' : 'missing'
      });
    }

    // Ações CRUD
    if (action === 'users') {
      return prisma.user.findMany({ take: 10 }).then(users => {
        res.status(200).json({ success: true, action: 'getUsers', count: users.length, users });
      }).catch(error => {
        res.status(500).json({ error: error.message });
      });
    }

    if (action === 'workspaces') {
      return prisma.workspace.findMany({ 
        take: 10,
        include: { columns: true, tasks: true }
      }).then(workspaces => {
        res.status(200).json({ success: true, action: 'getWorkspaces', count: workspaces.length, workspaces });
      }).catch(error => {
        res.status(500).json({ error: error.message });
      });
    }

    if (action === 'columns') {
      return prisma.column.findMany({ 
        take: 10,
        include: { tasks: true }
      }).then(columns => {
        res.status(200).json({ success: true, action: 'getColumns', count: columns.length, columns });
      }).catch(error => {
        res.status(500).json({ error: error.message });
      });
    }

    if (action === 'tasks') {
      return prisma.task.findMany({ take: 20 }).then(tasks => {
        res.status(200).json({ success: true, action: 'getTasks', count: tasks.length, tasks });
      }).catch(error => {
        res.status(500).json({ error: error.message });
      });
    }
  }

  // POST /api/health para salvar dados
  if (req.method === 'POST') {
    // Salvar usuário de teste
    prisma.user.create({
      data: {
        email: `user-${Date.now()}@vercel.db`,
        name: 'User from Vercel',
        password: 'test123',
      },
    }).then(user => {
      return res.status(201).json({ 
        success: true,
        message: 'SALVO NO BANCO VERCEL POSTGRES!',
        user: user,
        timestamp: new Date().toISOString() 
      });
    }).catch(error => {
      return res.status(500).json({ 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
    });
  } else if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(400).json({ error: 'Invalid request' });
}


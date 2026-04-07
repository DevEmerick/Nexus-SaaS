export const config = {
  runtime: 'nodejs18.x',
  maxDuration: 30,
};

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  const url = req.url.split('?')[0];
  
  // Debug log
  console.log('API Handler - URL:', url, 'Method:', req.method);
  
  // Set CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Test create endpoint
  if (url === '/test-create') {
    return testCreate(res);
  }

  // Test fetch endpoint
  if (url === '/test-fetch') {
    return testFetch(res);
  }

  // Health check endpoint
  if (url === '/health') {
    return res.status(200).json({
      status: 'API running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      database: process.env.DATABASE_URL ? 'configured' : 'missing'
    });
  }

  // Status endpoint
  if (url === '/status') {
    return res.status(200).json({
      ok: true,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  }

  // Test create endpoint - cria dados no banco Vercel
  if (url === '/test-create') {
    return testCreate(res);
  }

  // Test fetch endpoint - busca dados salvos
  if (url === '/test-fetch') {
    return testFetch(res);
  }

  // Default 404
  return res.status(404).json({ error: 'Not found', path: url });
}

async function testCreate(res) {
  try {
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@vercel.test`,
        name: 'Test User from Vercel',
        password: 'testpassword123',
      },
    });

    const testWorkspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace from Vercel',
        ownerId: testUser.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Dados criados com sucesso no banco Vercel Postgres',
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
      },
      workspace: {
        id: testWorkspace.id,
        name: testWorkspace.name,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      hint: 'Verifique se DATABASE_URL está configurado no Vercel e acessível',
    });
  }
}

async function testFetch(res) {
  try {
    const users = await prisma.user.findMany({
      take: 5,
      include: {
        workspaces: true,
      },
    });

    const workspaces = await prisma.workspace.findMany({
      take: 5,
    });

    return res.status(200).json({
      success: true,
      message: 'Dados recuperados do banco Vercel Postgres',
      totalUsers: users.length,
      totalWorkspaces: workspaces.length,
      recentUsers: users,
      recentWorkspaces: workspaces,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      hint: 'Verifique se DATABASE_URL está configurado no Vercel',
    });
  }
}
  return res.status(404).json({ error: 'Not found', path: url });
}

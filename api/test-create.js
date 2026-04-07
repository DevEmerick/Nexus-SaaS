import { PrismaClient } from '@prisma/client';

export const config = {
  runtime: 'nodejs18.x',
  maxDuration: 30,
};

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Criar usuário de teste
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@vercel.test`,
        name: 'Test User from Vercel',
        password: 'testpassword123',
      },
    });

    // Criar workspace de teste
    const testWorkspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace from Vercel',
        ownerId: testUser.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Dados criados com sucesso NO BANCO VERCEL POSTGRES',
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
    console.error('Erro ao criar dados:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      hint: 'Verifique DATABASE_URL no Vercel dashboard',
    });
  }
}

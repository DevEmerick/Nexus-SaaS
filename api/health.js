import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Se for POST, salva dados no banco
  if (req.method === 'POST') {
    prisma.user.create({
      data: {
        email: `user-${Date.now()}@vercel.db`,
        name: 'User from Health Endpoint',
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
  } else {
    // GET: retorna status
    return res.status(200).json({ 
      status: 'API running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      database: process.env.DATABASE_URL ? 'configured' : 'missing'
    });
  }
}

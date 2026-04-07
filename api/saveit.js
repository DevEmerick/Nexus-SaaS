import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Criar usuário no banco Vercel
  prisma.user.create({
    data: {
      email: `user-${Date.now()}@vercel.db`,
      name: 'Vercel DB Test',
      password: 'pass123',
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
      hint: 'Verifique DATABASE_URL no Vercel',
      timestamp: new Date().toISOString() 
    });
  });
}

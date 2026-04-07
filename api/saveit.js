import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const user = await prisma.user.create({
      data: {
        email: `user-${Date.now()}@vercel.db`,
        name: 'Vercel User',
        password: 'pass123',
      },
    });

    res.status(201).json({ 
      success: true,
      message: 'SALVO NO BANCO VERCEL!',
      user: user,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
}

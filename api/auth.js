import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
    const { action, email, password, name } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'action parameter required (login or register)',
      });
    }

    if (action === 'login') {
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'email and password are required',
        });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'User not found',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid password',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          phone: user.phone,
          themePreference: user.themePreference,
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'register') {
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'email, password, and name are required',
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar,
          phone: newUser.phone,
          themePreference: newUser.themePreference,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use "login" or "register"',
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
}

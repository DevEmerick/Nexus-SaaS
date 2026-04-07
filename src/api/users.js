import express from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET - Listar usuários (apenas admin)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo usuário (registro)
router.post('/', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password e name são obrigatórios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Pegar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, themePreference: true }
    });
    
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Atualizar usuário
router.patch('/:id', async (req, res) => {
  try {
    const { name, themePreference } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name: name || undefined,
        themePreference: themePreference || undefined
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

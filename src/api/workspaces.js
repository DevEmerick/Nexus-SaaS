import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET - Listar workspaces do usuário autenticado
router.get('/my', async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: { userId: req.user.id },
      include: { columns: { orderBy: { position: 'asc' } }, tasks: true }
    });
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo workspace
router.post('/', async (req, res) => {
  try {
    const { title, color } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'título é obrigatório' });
    }

    const workspace = await prisma.workspace.create({
      data: { 
        title: title.trim(), 
        color: color || '#6366f1',
        userId: req.user.id
      },
      include: { columns: true }
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter um workspace específico
router.get('/:id', async (req, res) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id },
      include: { 
        columns: { 
          orderBy: { position: 'asc' },
          include: { tasks: { where: { deletedAt: null } } } 
        }
      }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace não encontrado' });
    }

    // Verificar autorização
    if (workspace.userId !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para acessar este workspace' });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Atualizar workspace
router.patch('/:id', async (req, res) => {
  try {
    const { title, color } = req.body;
    
    // Verificar se o workspace existe e pertence ao usuário
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace não encontrado' });
    }

    if (workspace.userId !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para atualizar este workspace' });
    }

    const updated = await prisma.workspace.update({
      where: { id: req.params.id },
      data: {
        title: title ? title.trim() : undefined,
        color: color || undefined
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar workspace (e todas as tasks associadas)
router.delete('/:id', async (req, res) => {
  try {
    // Verificar se o workspace existe e pertence ao usuário
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace não encontrado' });
    }

    if (workspace.userId !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para deletar este workspace' });
    }

    await prisma.workspace.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Workspace deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

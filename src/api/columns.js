import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET - Listar colunas de um workspace
router.get('/workspace/:workspaceId', async (req, res) => {
  try {
    const columns = await prisma.column.findMany({
      where: { workspaceId: req.params.workspaceId },
      orderBy: { position: 'asc' },
      include: { tasks: { where: { deletedAt: null } } }
    });

    res.json(columns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter uma coluna específica
router.get('/:id', async (req, res) => {
  try {
    const column = await prisma.column.findUnique({
      where: { id: req.params.id },
      include: { tasks: { where: { deletedAt: null } } }
    });

    if (!column) {
      return res.status(404).json({ error: 'Coluna não encontrada' });
    }

    res.json(column);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar nova coluna
router.post('/', async (req, res) => {
  try {
    const { title, color, workspaceId, position } = req.body;

    if (!title || !workspaceId) {
      return res.status(400).json({ error: 'título e workspaceId são obrigatórios' });
    }

    // Verificar se o workspace pertence ao usuário (via coluna ou direto)
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace || workspace.userId !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para criar coluna neste workspace' });
    }

    // Se position não foi fornecida, contar quantas colunas já existem
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPosition = await prisma.column.aggregate({
        where: { workspaceId },
        _max: { position: true }
      });
      finalPosition = (maxPosition._max.position || 0) + 1;
    }

    const column = await prisma.column.create({
      data: {
        title: title.trim(),
        color: color || '#6366f1',
        position: finalPosition,
        workspaceId
      }
    });

    res.status(201).json(column);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Atualizar coluna
router.patch('/:id', async (req, res) => {
  try {
    const { title, color, position } = req.body;

    const column = await prisma.column.findUnique({
      where: { id: req.params.id }
    });

    if (!column) {
      return res.status(404).json({ error: 'Coluna não encontrado' });
    }

    // Verificar autorização
    const workspace = await prisma.workspace.findUnique({
      where: { id: column.workspaceId }
    });

    if (!workspace || workspace.userId !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para atualizar esta coluna' });
    }

    const updated = await prisma.column.update({
      where: { id: req.params.id },
      data: {
        title: title ? title.trim() : undefined,
        color: color || undefined,
        position: position !== undefined ? position : undefined
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar coluna
router.delete('/:id', async (req, res) => {
  try {
    const column = await prisma.column.findUnique({
      where: { id: req.params.id }
    });

    if (!column) {
      return res.status(404).json({ error: 'Coluna não encontrada' });
    }

    // Verificar autorização
    const workspace = await prisma.workspace.findUnique({
      where: { id: column.workspaceId }
    });

    if (!workspace || workspace.userId !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para deletar esta coluna' });
    }

    // Soft delete de todas as tasks associadas
    await prisma.task.updateMany({
      where: { columnId: req.params.id },
      data: { deletedAt: new Date() }
    });

    await prisma.column.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Coluna deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
